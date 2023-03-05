# acuparse-prometheus

A simple Prometheus exporter that reads information from an AcuParse instance.

## Installation

```sh
git clone https://github.com/znepb/acuparse-prometheus.git
cd acuparse-prometheus.git
docker build . -t acuparse-prometheus --build-arg ENDPOINT="your acuparse endpoint here, no trailing slash"
docker run -dp 9081:9081 --name="acuparse-prometheus" acuparse-prometheus
```
