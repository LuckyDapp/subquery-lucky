sudo -u postgres psql template1
create extension if not exists btree_gist;

sudo -u postgres psql

create database subql_lucky_shibuya;
create user subql_lucky_shibuya encrypted password 'toto';
grant all privileges on database subql_lucky_shibuya to subql_lucky_shibuya;

create database subql_lucky_shiden;
create user subql_lucky_shiden encrypted password 'toto';
grant all privileges on database subql_lucky_shiden to subql_lucky_shiden;

create database subql_lucky_astar;
create user subql_lucky_astar encrypted password 'toto';
grant all privileges on database subql_lucky_astar to subql_lucky_astar;