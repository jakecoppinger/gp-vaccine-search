#!/usr/bin/env bash
set -e
echo "Make sure watch build script has been stopped!"

./build.sh

aws s3 sync dist/ s3://sydneytransitgraph.com/ --delete

aws s3 cp s3://sydneytransitgraph.com/index.html s3://sydneytransitgraph.com/index.html --metadata-directive REPLACE --cache-control max-age=0,no-cache,no-store,must-revalidate --content-type text/html --acl public-read
aws s3 cp s3://sydneytransitgraph.com/about/index.html s3://sydneytransitgraph.com/about/index.html --metadata-directive REPLACE --cache-control max-age=0,no-cache,no-store,must-revalidate --content-type text/html --acl public-read
