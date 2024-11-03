-- Function to match similar embeddings using cosine similarity
create or replace function match_embeddings(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  user_id uuid,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    id,
    user_id,
    1 - (embeddings.embedding <=> query_embedding) as similarity
  from embeddings
  where 1 - (embeddings.embedding <=> query_embedding) > match_threshold
  order by embeddings.embedding <=> query_embedding
  limit match_count;
end;
$$;