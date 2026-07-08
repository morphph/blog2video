#!/bin/zsh
# assemble.sh —— 从 kit 真源(../wb-base.css / ../wb-motion.js)+ _src 片段组装黄金样例场景。
# kit 文件改动后重跑本脚本,样例与真源永不漂移。产物 = scene-wb-NN/index.html(自包含,内联 css/js)。
set -e
cd "${0:A:h}"
for s in scene-wb-01 scene-wb-02; do
  {
    cat _src/head.html
    cat ../wb-base.css
    cat "_src/$s.body.html"
    cat ../wb-motion.js
    cat "_src/$s.tl.js"
    printf '</script>\n</body>\n</html>\n'
  } > "$s/index.html"
  echo "assembled $s/index.html"
done
