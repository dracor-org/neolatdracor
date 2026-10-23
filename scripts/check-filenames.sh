#!/usr/bin/env bash
#
# Checks that every file in tei/ and docx/ is named after the name of an
# entry in meta.yaml. Requires yq (https://github.com/mikefarah/yq).
#
# Files listed in scripts/check-filenames.ignore are skipped.

cd "$(dirname "$0")/.." || exit 1

names=$(yq '.[].name' meta.yaml)
ignored=$(grep -v '^#' scripts/check-filenames.ignore 2>/dev/null)
errors=0

for file in tei/*.xml docx/*.docx; do
  [ -e "$file" ] || continue
  base=$(basename "$file")
  name="${base%.*}"
  if grep -qxF "$name" <<< "$names"; then
    if grep -qxF "$file" <<< "$ignored"; then
      echo "::notice file=$file::Matches a name now and can be removed from check-filenames.ignore"
    fi
  elif grep -qxF "$file" <<< "$ignored"; then
    echo "Ignoring $file"
  else
    echo "::error file=$file::No entry with name '$name' in meta.yaml"
    errors=$((errors + 1))
  fi
done

if [ "$errors" -gt 0 ]; then
  echo "$errors file(s) without matching name in meta.yaml"
  exit 1
fi

echo "All files in tei/ and docx/ match a name in meta.yaml (apart from ignored files)"
