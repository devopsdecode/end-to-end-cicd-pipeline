  #!/bin/bash
  # Deploy monitoring using Helm charts
  export KUBECONFIG=/home/ubuntu/kubeconfig

  echo "🚀 Installing monitoring stack with Helm..."

  # Install Helm (if not installed)
  if ! command -v helm &> /dev/null; then
      echo "📦 Installing Helm..."
      curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
  fi

  # Add Prometheus community repo
  helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
  helm repo update

  # Install kube-prometheus-stack (Prometheus + Grafana + Alertmanager)
  helm install monitoring prometheus-community/kube-prometheus-stack \
    --set prometheus.service.type=NodePort \
    --set prometheus.service.nodePort=30090 \
    --set grafana.service.type=NodePort \
    --set grafana.service.nodePort=30030 \
    --set grafana.adminPassword=admin123

  echo "⏳ Waiting for pods to be ready..."
  kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=prometheus --timeout=300s
  kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=grafana --timeout=300s

  echo "✅ Monitoring stack deployed!"
  echo "📊 Prometheus: http://$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[0].address}'):30090"
  echo "📈 Grafana: http://$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[0].address}'):30030 (admin/admin123)"
