#!/bin/bash

echo "Initializing DynamoDB ..."
aws dynamodb create-table \
 --cli-input-json file:///localstack/posts-table.json \
 --region eu-west-1 \
 --endpoint-url http://localhost:4566

echo "All Resources initialized! 🚀"