resource "aws_dynamodb_table" "policies" {
  name         = "${var.project}-policies"
  billing_mode = "PAY_PER_REQUEST" # on-demand: pay per request, nothing to provision
  hash_key     = "id"
  attribute {
    name = "id"
    type = "S"
  }
}

resource "aws_dynamodb_table" "audit" {
  name         = "${var.project}-audit"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"
  attribute {
    name = "id"
    type = "S"
  }
}
