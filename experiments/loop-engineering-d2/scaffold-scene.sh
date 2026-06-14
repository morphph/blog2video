#!/bin/zsh
# usage: ./scaffold-scene.sh 07   -> creates scenes/scene-07/{assets symlink, hyperframes.json, meta.json}
NN=$1
D="scenes/scene-$NN"
mkdir -p "$D"
ln -sfn ../../assets "$D/assets"
printf '{ "$schema": "https://hyperframes.heygen.com/schema/hyperframes.json", "paths": { "assets": "assets" } }\n' > "$D/hyperframes.json"
printf '{ "id": "s%s", "name": "scene-%s", "createdAt": "2026-06-14T00:00:00.000Z" }\n' "$NN" "$NN" > "$D/meta.json"
echo "scaffolded $D (write index.html next)"
