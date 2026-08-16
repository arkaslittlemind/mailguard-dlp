# --- IAM: let Lambda assume a role, write logs, and access our two tables ---
data "aws_iam_policy_document" "assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "api" {
  name               = "${var.project}-api-role"
  assume_role_policy = data.aws_iam_policy_document.assume.json
}

resource "aws_iam_role_policy_attachment" "logs" {
  role       = aws_iam_role.api.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "aws_iam_policy_document" "ddb" {
  statement {
    actions = [
      "dynamodb:GetItem", "dynamodb:PutItem",
      "dynamodb:DeleteItem", "dynamodb:Scan", "dynamodb:Query"
    ]
    resources = [
      aws_dynamodb_table.policies.arn,
      aws_dynamodb_table.audit.arn
    ]
  }
}

resource "aws_iam_role_policy" "ddb" {
  name   = "${var.project}-ddb-access"
  role   = aws_iam_role.api.id
  policy = data.aws_iam_policy_document.ddb.json
}

# --- Package apps/api/dist into a zip Terraform can upload ---
data "archive_file" "api" {
  type        = "zip"
  source_dir  = "${path.module}/../apps/api/dist"
  output_path = "${path.module}/build/api.zip"
}

resource "aws_lambda_function" "api" {
  function_name    = "${var.project}-api"
  role             = aws_iam_role.api.arn
  runtime          = "nodejs20.x"
  handler          = "lambda.handler" # file lambda.mjs, export handler
  filename         = data.archive_file.api.output_path
  source_code_hash = data.archive_file.api.output_base64sha256
  timeout          = 15
  memory_size      = 256

  environment {
    variables = {
      POLICIES_TABLE = aws_dynamodb_table.policies.name
      AUDIT_TABLE    = aws_dynamodb_table.audit.name
      # DYNAMODB_ENDPOINT intentionally UNSET → SDK uses real DynamoDB
    }
  }
}

# --- Public HTTPS endpoint with CORS, no API Gateway needed ---
resource "aws_lambda_function_url" "api" {
  function_name      = aws_lambda_function.api.function_name
  authorization_type = "NONE"
  cors {
    allow_origins = ["*"] # tighten to your CloudFront domain in real use
    allow_methods = ["*"]
    allow_headers = ["content-type"]
  }
}

output "api_url" {
  value = aws_lambda_function_url.api.function_url
}
