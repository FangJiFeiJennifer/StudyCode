### git reset 
reset命令会将HEAD引用指向给定提交。
#### git reset --soft commit_id
索引和工作目录的内容保持不变，只改变一个符号引用的状态使其指向一个新提交。
>仅仅改变HEAD的指向的位置

#### git reset --mixed commit_id
索引内容也跟随着改变以符合给定提交的树结构，但是工作目录中的内容保持不变。

>注意：--mixed是git reset的默认模式
>不仅改变HEAD的指向，还会将已经commit的内容，回滚，但是不会删除改动

#### git reset --hard commit_id
索引内容也跟随着改变以符合给定提交的树结构，此外，工作目录的内容也会改变，指定提交之前的内容都将被删除。
>不仅改变HEAD的指向，还会将已经commit的内容删除