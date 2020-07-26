#!/usr/bin/env sh

notes='./source/_posts/notes/'
index_deploy='../index-deploy/www/'
ignores=('projects' 'projects1')
dist='./dist/'


# 确保脚本抛出遇到的错误
set -e


cd $notes
git add -A && git commit -m '+' && git push
cd -


# 生成静态文件,压缩
npm run clean && npm run build && npx gulp


test -e $index_deploy || mkdir -p $index_deploy

# 删除旧文件
cd $index_deploy
for var in $(ls)
do
    # 如果$var在ignores内
    if echo ${ignores[@]}|grep -q $var;then
        echo "$(realpath $var) retained"
        continue
    else
        rm -rf $var && echo "$(realpath $var) deleted"
    fi
done
cd -


# dist不存在则报错
test -e $dist || exit 1

# 复制新文件
cp -af "$dist." $index_deploy


cd "$index_deploy/.."
git add -A && git commit -m 'deploy' && git push
cd -


echo "Completed !"