# Public entry point: an API Gateway HTTP API that proxies every request to the
# Lambda. HTTP APIs are publicly reachable by default — no anonymous-invoke
# resource policy needed — which is why this works where the Function URL didn't.
#
# CORS is handled by the Express app's own cors() middleware, so we do NOT set
# cors_configuration here (doing both would send duplicate CORS headers, which
# browsers reject). The $default route forwards every method/path — including
# OPTIONS preflight — to Express.

resource "aws_apigatewayv2_api" "api" {
  name          = "${var.project}-http-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "api" {
  api_id                 = aws_apigatewayv2_api.api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api.invoke_arn
  payload_format_version = "2.0"
}

# Catch-all route: send everything to the Lambda; Express does the routing.
resource "aws_apigatewayv2_route" "default" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.api.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true
}

# Let API Gateway invoke the function.
resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowApiGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

output "api_url" {
  value = aws_apigatewayv2_stage.default.invoke_url
}
