create table posts (
    id serial primary key,
    title text not null,
    content text not null,
    published_at timestamptz default current_timestamp,
    updated_at timestamptz default current_timestamp
);

create table comments (
    id serial primary key,
    post_id integer references posts(id) on delete cascade,
    author_name text not null,
    comment_text text not null,
    created_at timestamptz default current_timestamp
); 