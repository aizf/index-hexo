#!/usr/bin/env sh

index_deploy='../index-deploy/www/'
ignores=('projects' 'projects1')
# ignores=('projects/' 'links/' 'a/')
dist='./dist/'


# 确保脚本抛出遇到的错误
set -e


# 生成静态文件
# npm run clean
# npm run build


# 压缩
# npx gulp


mkdir -p $index_deploy

# 删除旧文件
cd $index_deploy
for var in $(ls)
do
    # 如果$var在ignores内
    if echo ${ignores[@]}|grep -q $var;then
        echo "$(realpath $var) retained"
        continue
    else
        echo "$(realpath $var) deleted"
        rm -rf $var
    fi
done
cd -


# dist不存在则报错
if !(test -e $dist);then
    exit 1
fi


# 复制新文件
cp -af "$dist." $index_deploy


cd "$index_deploy/.."
git add -A
git commit -m 'deploy'
git push


cd -
echo "Completed !"