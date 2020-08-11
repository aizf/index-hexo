#!/usr/bin/env sh

notes='./source/_posts/notes/'
index_deploy='../index-deploy/'
index_deploy_index="${index_deploy}www/index/"
dist='./dist/'


# 确保脚本抛出遇到的错误
set -e

realpath .

test -d $index_deploy || exit 1

git submodule update --init --remote --recursive

# 生成静态文件,压缩
npm run clean && npm run build && npx gulp
# dist不存在则报错
test -d $dist || exit 1


test -d $index_deploy_index && rm -rf $index_deploy_index
mkdir -p $index_deploy_index
# 复制新文件
cp -af "${dist}." $index_deploy_index && echo "copied to $(realpath $index_deploy_index)"


# cd $index_deploy
# git add -A && git commit -m 'deploy' && git push || (git pull && git push)
# cd -


echo "Completed !"