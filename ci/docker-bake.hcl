###############################################################################
# BoniCare Docker Bake Configuration
###############################################################################

variable "REGISTRY" {
    default = "docker.io"
}

variable "NAMESPACE" {
    default = "keroliskhalaf"
}

variable "VERSION" {
    default = "latest"
}

###############################################################################
# Groups
###############################################################################

group "default" {
    targets = [
        "backend",
        "frontend",
        "ai-service",
        "webrtc"
    ]
}

###############################################################################
# Common Configuration
###############################################################################

target "_common" {
    cache-from = [
        "type=local,src=/tmp/.buildx-cache"
    ]

    cache-to = [
        "type=local,dest=/tmp/.buildx-cache,mode=max"
    ]

    platforms = [
        "linux/amd64"
    ]


    labels = {
        project = "BoniCare"
        team = "DevOps"
    }

}

###############################################################################
# Backend
###############################################################################

target "backend" {

    inherits = ["_common"]

    context = "./apps/bonicare-backend"

    dockerfile = "Dockerfile"

    tags = [
        "bonicare-backend:latest",
        "${REGISTRY}/${NAMESPACE}/bonicare-backend:${VERSION}"
    ]

}

###############################################################################
# Frontend
###############################################################################

target "frontend" {

    inherits = ["_common"]

    context = "./apps/bonicare-frontend"

    dockerfile = "Dockerfile"

    tags = ["bonicare-frontend:latest",
        "${REGISTRY}/${NAMESPACE}/bonicare-frontend:${VERSION}"
    ]

}

###############################################################################
# AI Service
###############################################################################

target "ai-service" {

    inherits = ["_common"]

    context = "./apps/ai-service"

    dockerfile = "Dockerfile"

    tags = ["bonicare-ai-service:latest",
        "${REGISTRY}/${NAMESPACE}/bonicare-ai-service:${VERSION}"
    ]

}

###############################################################################
# WebRTC
###############################################################################

target "webrtc" {

    inherits = ["_common"]

    context = "./apps/webrtc"

    dockerfile = "Dockerfile"

    tags = ["bonicare-webrtc:latest",
        "${REGISTRY}/${NAMESPACE}/bonicare-webrtc:${VERSION}"
    ]

}