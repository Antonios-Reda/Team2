variable "REGISTRY" { default = "docker.io" }
variable "NAMESPACE" { default = "keroliskhalaf" }
variable "VERSION" { default = "latest" }

# مجموعة الاستهدافات للخدمات
group "default" {
    targets = ["backend", "frontend", "ai-service", "webrtc"]
}

# الإعدادات العامة المشتركة (DRY Principle)
target "_common" {
    platforms = ["linux/amd64"]
    labels = {
        "org.opencontainers.image.created" = "${timestamp()}"
        "org.opencontainers.image.authors" = "DevOps-Team2"
        "project" = "BoniCare"
    }
    # ضمان استخدام BuildKit لسرعة البناء
    output = ["type=registry"]
}

target "backend" {
    inherits = ["_common"]
    context = "../apps/bonicare-backend"
    dockerfile = "Dockerfile"
}

target "frontend" {
    inherits = ["_common"]
    context = "../apps/bonicare-frontend"
    dockerfile = "Dockerfile"
}

target "ai-service" {
    inherits = ["_common"]
    context = "../apps/ai-service"
    dockerfile = "Dockerfile"
}

target "webrtc" {
    inherits = ["_common"]
    context = "../apps/webrtc"
    dockerfile = "Dockerfile"
}