CREATE OR REPLACE FUNCTION public.match_embeddings(vec float8[], location_id_input uuid, limit_input int)
RETURNS TABLE(id uuid, doc_id uuid, location_id uuid, content text, similarity float) AS $$
BEGIN
  RETURN QUERY
  SELECT e.id, e.doc_id, e.location_id, e.content, 1 - (e.embedding <#> vec) AS similarity
  FROM embeddings e
  WHERE e.location_id = location_id_input
  ORDER BY e.embedding <#> vec
  LIMIT limit_input;
END;
$$ LANGUAGE plpgsql;
