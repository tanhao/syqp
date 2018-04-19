cnpm install -g mysql
cnpm install -g log4js


1. server_account 账号服务器
2. server_hall  大厅服务器
3. server_game  游戏服务器

集群说明 

1.游戏服务器启动，先向大厅服务器注册游戏服务器（服务器IP，端口）。
2.定时通过HTTP(service_http)向大厅服务器发送数据



问题
1.明杆的要不要算进包
2.只有最后一个牌能不能杠


换牌命令：
s1-s9   代表1-9梭
t1-t9   代表1-9筒
w1-w9   代表1-9万
d,x,n,b,z,f,b 代表 东酉南北中发白
c       代表财神