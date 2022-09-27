terraform {
	required_providers {
		koyeb = {
			source  = "koyeb/koyeb"
			version = "~> 0.1.0"
		}
	}
	cloud {
		organization = "cherryblossom"
		workspaces {
			name = "comrade-pingu"
		}
	}
}

provider "koyeb" {}

locals {
	app_name = "comrade-pingu"
	port     = 3000
}

resource "koyeb_app" "comrade-pingu" {
	name = local.app_name
}

resource "koyeb_service" "discord-bot" {
	app_name = local.app_name
	definition {
		name = "discord-bot"
		docker {
			image                = "ghcr.io/cherryblossom000/${local.app_name}"
			image_registy_secret = "github-package-read"
			# https://github.com/koyeb/terraform-provider-koyeb/issues/24
			# args                 = ["port=${local.port}"]
		}
		instance_types {
			type = "nano"
		}
		scalings {
			min = 1
			max = 1
		}
		regions = ["par"]
		ports {
			port     = local.port
			protocol = "http"
		}
		routes {
			path = "/"
			port = local.port
		}
		env {
			key   = "NODE_ENV"
			value = "production"
		}
		env {
			key   = "PORT"
			value = local.port
		}
		env {
			key    = "DISCORD_TOKEN"
			secret = "${local.app_name}-discord-token"
		}
		env {
			key    = "DB_USER"
			secret = "${local.app_name}-db-user"
		}
		env {
			key    = "DB_PASSWORD"
			secret = "${local.app_name}-db-password"
		}
	}

	depends_on = [koyeb_app.comrade-pingu]
}
