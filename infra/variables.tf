variable "region" {
  type    = string
  default = "ap-northeast-1"
}

variable "project" {
  type    = string
  default = "mailguard"
}

variable "web_bucket_name" {
  type        = string
  description = "mailguard-dlp-client"
}
