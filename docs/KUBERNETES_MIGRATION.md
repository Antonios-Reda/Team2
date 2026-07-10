# GitOps & Kubernetes Migration Path

1. **Convert Templates to Helm:** The current `templates/` in roles will be mapped to `charts/bonicare/templates/`.
2. **Global Vars to Values.yaml:** All `group_vars/all.yml` content maps directly to `values.yaml`.
3. **Infrastructure as Code:** Terraform will manage the node pool, while Helm manages the application lifecycle.
4. **Current Status:** Ready for GitOps via ArgoCD/Flux (simply point to this repo).