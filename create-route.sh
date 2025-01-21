#!/bin/bash

# Check if a feature name is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <feature-name>"
  exit 1
fi

FEATURE_NAME=$1
BASE_DIR="./src/app"
FEATURE_DIR="$BASE_DIR/$FEATURE_NAME"

# Check if the directory already exists
if [ -d "$FEATURE_DIR" ]; then
  echo "Directory '$FEATURE_NAME' already exists."
  exit 1
fi

# Create the directory
mkdir -p "$FEATURE_DIR"

# Define the content for the files
ERROR_CONTENT='"use client";
import React from "react";

export default function Error() {
  return <div>Error</div>;
}
'

LOADING_CONTENT='import React from "react";

export default function Loading() {
  return <div>Loading...</div>;
}
'

NOT_FOUND_CONTENT='import React from "react";

export default function NotFound() {
  return <div>NotFound</div>;
}
'

PAGE_CONTENT='import React from "react";

export default function Page() {
  return <div>Page</div>;
}
'

# Create files with the content
echo "$ERROR_CONTENT" > "$FEATURE_DIR/error.tsx"
echo "$LOADING_CONTENT" > "$FEATURE_DIR/loading.tsx"
echo "$NOT_FOUND_CONTENT" > "$FEATURE_DIR/not-found.tsx"
echo "$PAGE_CONTENT" > "$FEATURE_DIR/page.tsx"

echo "Feature '$FEATURE_NAME' created successfully."
