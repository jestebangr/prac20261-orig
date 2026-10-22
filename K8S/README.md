# Ejercicio 4: Kubernetes con kind

`sample-app.yaml`: aplicación de ejemplo (Deployment + Service NodePort de Nginx) que se despliega en el clúster kind en el último apartado del ejercicio.

```bash
kubectl apply -f sample-app.yaml
kubectl get pods -A
```
