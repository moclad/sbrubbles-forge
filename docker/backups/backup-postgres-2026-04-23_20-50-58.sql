--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Debian 17.5-1.pgdg120+1)
-- Dumped by pg_dump version 17.5 (Debian 17.5-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE IF EXISTS postgres;
--
-- Name: postgres; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE postgres WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE postgres OWNER TO postgres;

\connect postgres

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DATABASE postgres; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON DATABASE postgres IS 'default administrative connection database';


--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO postgres;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'user',
    'admin',
    'superAdmin'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: postgres
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS'
);


ALTER TYPE storage.buckettype OWNER TO postgres;

--
-- Name: add_prefixes(text, text); Type: FUNCTION; Schema: storage; Owner: postgres
--

CREATE FUNCTION storage.add_prefixes(_bucket_id text, _name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;


ALTER FUNCTION storage.add_prefixes(_bucket_id text, _name text) OWNER TO postgres;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: postgres
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO postgres;

--
-- Name: delete_prefix(text, text); Type: FUNCTION; Schema: storage; Owner: postgres
--

CREATE FUNCTION storage.delete_prefix(_bucket_id text, _name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


ALTER FUNCTION storage.delete_prefix(_bucket_id text, _name text) OWNER TO postgres;

--
-- Name: delete_prefix_hierarchy_trigger(); Type: FUNCTION; Schema: storage; Owner: postgres
--

CREATE FUNCTION storage.delete_prefix_hierarchy_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;


ALTER FUNCTION storage.delete_prefix_hierarchy_trigger() OWNER TO postgres;

--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: postgres
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION storage.enforce_bucket_name_length() OWNER TO postgres;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: postgres
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO postgres;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: postgres
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO postgres;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: postgres
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO postgres;

--
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: postgres
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


ALTER FUNCTION storage.get_level(name text) OWNER TO postgres;

--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: postgres
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


ALTER FUNCTION storage.get_prefix(name text) OWNER TO postgres;

--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: postgres
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


ALTER FUNCTION storage.get_prefixes(name text) OWNER TO postgres;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: postgres
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO postgres;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: postgres
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO postgres;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: postgres
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text) OWNER TO postgres;

--
-- Name: objects_insert_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: postgres
--

CREATE FUNCTION storage.objects_insert_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_insert_prefix_trigger() OWNER TO postgres;

--
-- Name: objects_update_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: postgres
--

CREATE FUNCTION storage.objects_update_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_update_prefix_trigger() OWNER TO postgres;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: postgres
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO postgres;

--
-- Name: prefixes_insert_trigger(); Type: FUNCTION; Schema: storage; Owner: postgres
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.prefixes_insert_trigger() OWNER TO postgres;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: postgres
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO postgres;

--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: postgres
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO postgres;

--
-- Name: search_v1_optimised(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: postgres
--

CREATE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO postgres;

--
-- Name: search_v2(text, text, integer, integer, text); Type: FUNCTION; Schema: storage; Owner: postgres
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
BEGIN
    RETURN query EXECUTE
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name || '/' AS name,
                    NULL::uuid AS id,
                    NULL::timestamptz AS updated_at,
                    NULL::timestamptz AS created_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
                ORDER BY prefixes.name COLLATE "C" LIMIT $3
            )
            UNION ALL
            (SELECT split_part(name, '/', $4) AS key,
                name,
                id,
                updated_at,
                created_at,
                metadata
            FROM storage.objects
            WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
            ORDER BY name COLLATE "C" LIMIT $3)
        ) obj
        ORDER BY name COLLATE "C" LIMIT $3;
        $sql$
        USING prefix, bucket_name, limits, levels, start_after;
END;
$_$;


ALTER FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text) OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: postgres
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: postgres
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: postgres
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: postgres
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: Page; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Page" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    street character varying(255) NOT NULL
);


ALTER TABLE public."Page" OWNER TO postgres;

--
-- Name: Page_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."Page" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Page_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account (
    id text NOT NULL,
    account_id text NOT NULL,
    provider_id text NOT NULL,
    user_id text NOT NULL,
    access_token text,
    refresh_token text,
    id_token text,
    access_token_expires_at timestamp without time zone,
    refresh_token_expires_at timestamp without time zone,
    scope text,
    password text,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.account OWNER TO postgres;

--
-- Name: category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.category (
    id text NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    icon character varying(100) NOT NULL,
    color character varying(7) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.category OWNER TO postgres;

--
-- Name: expense; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expense (
    id text NOT NULL,
    trip_id text NOT NULL,
    category_id text NOT NULL,
    description text,
    amount real NOT NULL,
    expense_date timestamp without time zone NOT NULL,
    location_name text,
    location_lat real,
    location_lng real,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.expense OWNER TO postgres;

--
-- Name: expense_person; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expense_person (
    expense_id text NOT NULL,
    person_id text NOT NULL
);


ALTER TABLE public.expense_person OWNER TO postgres;

--
-- Name: invitation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invitation (
    id text NOT NULL,
    organization_id text NOT NULL,
    email text NOT NULL,
    role public."Role",
    status text DEFAULT 'pending'::text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    inviter_id text NOT NULL
);


ALTER TABLE public.invitation OWNER TO postgres;

--
-- Name: jwks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jwks (
    created_at timestamp without time zone NOT NULL,
    id text NOT NULL,
    private_key text NOT NULL,
    public_key text NOT NULL
);


ALTER TABLE public.jwks OWNER TO postgres;

--
-- Name: member; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.member (
    id text NOT NULL,
    organization_id text NOT NULL,
    user_id text NOT NULL,
    role public."Role" DEFAULT 'user'::public."Role" NOT NULL,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.member OWNER TO postgres;

--
-- Name: organization; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organization (
    id text NOT NULL,
    name text NOT NULL,
    slug text,
    logo text,
    created_at timestamp without time zone NOT NULL,
    metadata text
);


ALTER TABLE public.organization OWNER TO postgres;

--
-- Name: passkey; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.passkey (
    id text NOT NULL,
    name text,
    public_key text NOT NULL,
    user_id text NOT NULL,
    credential_i_d text NOT NULL,
    counter integer NOT NULL,
    device_type text NOT NULL,
    backed_up boolean NOT NULL,
    transports text,
    created_at timestamp without time zone,
    aaguid text
);


ALTER TABLE public.passkey OWNER TO postgres;

--
-- Name: person; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.person (
    id text NOT NULL,
    name character varying(255) NOT NULL,
    avatar_url text,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.person OWNER TO postgres;

--
-- Name: s3_objects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.s3_objects (
    id text NOT NULL,
    bucket text NOT NULL,
    "fileName" text NOT NULL,
    "originalFileName" text NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    "fileSize" integer,
    created_by text NOT NULL,
    updated_by text NOT NULL
);


ALTER TABLE public.s3_objects OWNER TO postgres;

--
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    id text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    token text NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    ip_address text,
    user_agent text,
    user_id text NOT NULL,
    impersonated_by text,
    active_organization_id text
);


ALTER TABLE public.session OWNER TO postgres;

--
-- Name: subscription; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription (
    id text NOT NULL,
    "userId" text NOT NULL,
    "subscriptionId" text NOT NULL,
    "customerId" text NOT NULL,
    "priceId" text NOT NULL,
    status text NOT NULL,
    "currentPeriodEnd" timestamp without time zone,
    "createdAt" timestamp without time zone NOT NULL,
    "updatedAt" timestamp without time zone NOT NULL
);


ALTER TABLE public.subscription OWNER TO postgres;

--
-- Name: trip; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trip (
    id text NOT NULL,
    name character varying(255) NOT NULL,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    location_name text,
    location_lat real,
    location_lng real,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    cover_photo_url text
);


ALTER TABLE public.trip OWNER TO postgres;

--
-- Name: trip_person; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trip_person (
    person_id text NOT NULL,
    trip_id text NOT NULL
);


ALTER TABLE public.trip_person OWNER TO postgres;

--
-- Name: two_factor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.two_factor (
    id text NOT NULL,
    secret text NOT NULL,
    backup_codes text NOT NULL,
    user_id text NOT NULL
);


ALTER TABLE public.two_factor OWNER TO postgres;

--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    email_verified boolean NOT NULL,
    image text,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    role public."Role" DEFAULT 'user'::public."Role" NOT NULL,
    banned boolean,
    ban_reason text,
    ban_expires timestamp without time zone,
    normalized_email text,
    two_factor_enabled boolean
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Name: verification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.verification (
    id text NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.verification OWNER TO postgres;

--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: postgres
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


ALTER TABLE storage.buckets OWNER TO postgres;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: postgres
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: postgres
--

CREATE TABLE storage.buckets_analytics (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.buckets_analytics OWNER TO postgres;

--
-- Name: iceberg_namespaces; Type: TABLE; Schema: storage; Owner: postgres
--

CREATE TABLE storage.iceberg_namespaces (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.iceberg_namespaces OWNER TO postgres;

--
-- Name: iceberg_tables; Type: TABLE; Schema: storage; Owner: postgres
--

CREATE TABLE storage.iceberg_tables (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    namespace_id uuid NOT NULL,
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    location text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.iceberg_tables OWNER TO postgres;

--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: postgres
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO postgres;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: postgres
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    level integer
);


ALTER TABLE storage.objects OWNER TO postgres;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: postgres
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: prefixes; Type: TABLE; Schema: storage; Owner: postgres
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE storage.prefixes OWNER TO postgres;

--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: postgres
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO postgres;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: postgres
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO postgres;

--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: postgres
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
1	0bab6905dc7431721421bc810799689efd2267875d33c92344325ad013f225c2	1737926336600
2	84d99fccfa1268ca845da8acc26071a63b0c8c273056fde2d90107a64c95b32a	1737926567135
3	a7ce282513fa04cb78c17286574668aab3bd6299ccd5480fbd252b4014282365	1738415834542
4	b21628b512c3eac5adee41a1a131ccd50f1f11d99e459abeae618d431a291655	1741901748118
5	07628a43af0161be5ac0726d60d4521ab2998de74a379d6728b22cbde5daf449	1743149811055
6	21d39be4291f0f671396b5a83daad531ced5bb2bb1d1adbe175b31e33ae63cc8	1743152041212
7	5dd355a4a33d6189cef4904eec3856787197430789f632661f2384f2b6f9c5cf	1743152066032
8	3d47e5b49cc7afcb943060935874d508bd4e6d42f89242563e507214bbdb7ec1	1743162033461
9	12355a4ec6b7c120f659b7a59b612c91125ff23d7fecf4a7b6a56b48052802bb	1745351261400
10	e41c84b332199c3f93d54bcc70fe086e590ba6e3075fd6f05b7bad46ce9a67d3	1752521124322
12	a8980e4aa3f46b3d6f10a6ca83b2cea387a3b5fd369e8ea0bca3f2af138d4daf	1753470050307
13	a8015b8740870c91bfdb02249df78bc2de8a14fa13c752e9fe845991877efc71	1775997977433
14	92797a3c79204537aa4d802c4baceaa71137ed183db9931354f31907c4f9f5d8	1776009775113
15	a3f0108f6b1ad476ad09cc9ecbf9b11777027d4302b4e0b5210fd2b0c59ab90e	1776024984542
16	451c263f346ffe11e240d784022062ed1cee620c97bd08185fbb2199ac7f8afe	1776029232552
17	f49144b40a2bcf68d5171e794207abda2d38bcf4830f30d1dd1d96c77f2ef0f7	1776368875025
\.


--
-- Data for Name: Page; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Page" (id, name, street) FROM stdin;
\.


--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.account (id, account_id, provider_id, user_id, access_token, refresh_token, id_token, access_token_expires_at, refresh_token_expires_at, scope, password, created_at, updated_at) FROM stdin;
SpoTxmEJDFNWY0PnefCNOasDPVdYbsKV	sEFR7xO9IwcmSBgre0JinliQrvEnor0w	credential	sEFR7xO9IwcmSBgre0JinliQrvEnor0w	\N	\N	\N	\N	\N	\N	1382f057cb71150dd7fdf7fef09fc535:2c4b1f84602f500ddb2e1074d6a93751f824eb09c5c1b0df2eb69e8989ba7384058eb0b040b567c54d4eddc73fe4f1e9e36e033fe7aa6161431c97fd0e5eaaf9	2025-07-15 19:08:20.993	2025-07-15 19:08:20.993
\.


--
-- Data for Name: category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.category (id, name, description, icon, color, created_at, updated_at) FROM stdin;
f9a2592e-341b-4c6b-a8d8-f50619ffa31b	Essen		Utensils	#45a7e8	2026-04-12 15:12:24.244	2026-04-12 15:12:24.244
79d22936-963a-4bff-b6dc-db7810681ac5	Supermarket		ShoppingCart	#9f26cf	2026-04-12 15:13:57.46	2026-04-12 15:13:57.46
5c20429e-f78a-4043-b58b-10ab188d9b9b	Eis		IceCream	#b926c9	2026-04-12 15:15:00.495	2026-04-12 15:15:00.495
cff2ae2c-3d75-4390-beb9-43cb5b8f0c14	Einkaufen		ShoppingBag	#356ded	2026-04-12 15:15:15.005	2026-04-12 15:15:15.005
4b58d08f-c365-4914-ac5f-614deffcfb0f	Kaffee		Coffee	#8F4803	2026-04-12 15:15:29.667	2026-04-12 15:15:29.667
bfca8255-d912-47da-af52-214848547f17	Drinks		Plane	#8C0404	2026-04-12 15:15:43.582	2026-04-12 15:15:43.582
eb56b5df-fd75-46c2-aef5-907d739b0fb5	Tanken		Fuel	#FF0004	2026-04-12 15:11:27.316	2026-04-12 15:17:03.571
c4ff36f9-1175-474a-a494-34977fae03e3	Maut		Car	#ED3EE5	2026-04-12 15:13:15.109	2026-04-12 15:17:16.979
1b23321e-61fd-4c66-9274-80ef9427133a	├£bernachtung		Bed	#00911A	2026-04-12 15:13:44.866	2026-04-19 17:38:13.739
6a9688e3-40ca-450d-ad1e-1f69c8662644	Trinkgeld		Zap	#DDC227	2026-04-19 17:38:39.511	2026-04-19 17:38:39.511
46f1ce33-8b02-49ee-b3a6-1d9e02b859ba	Parken		Car	#c2da49	2026-04-19 17:41:45.964	2026-04-19 17:41:45.964
\.


--
-- Data for Name: expense; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expense (id, trip_id, category_id, description, amount, expense_date, location_name, location_lat, location_lng, created_at, updated_at) FROM stdin;
09818fff-f8b1-4e96-be0c-1e015158db16	85f95b14-5653-4595-8ff4-f1350019712b	eb56b5df-fd75-46c2-aef5-907d739b0fb5	Shell	70	2026-03-30 22:00:00	Sanremo, Provincia di Imperia, Liguria, 18034, Italy	43.80862	7.76097	2026-04-17 20:26:22.646	2026-04-17 20:26:22.646
05b16c22-57c4-4a93-8101-80e494a8d034	85f95b14-5653-4595-8ff4-f1350019712b	1b23321e-61fd-4c66-9274-80ef9427133a	Vila Rita	651	2026-03-30 22:00:00	Sanremo, Provincia di Imperia, Liguria, 18034, Italy	43.80862	7.76097	2026-04-17 20:24:57.216	2026-04-19 12:38:24.112
61766cec-031f-40be-a18f-beefb61ec28d	85f95b14-5653-4595-8ff4-f1350019712b	f9a2592e-341b-4c6b-a8d8-f50619ffa31b	5	120	2026-03-30 22:00:00	Alessandria, Piedmont, Italy	44.908424	8.6116705	2026-04-17 20:30:37.571	2026-04-19 15:48:11.533
4d08dba7-39ad-4e6c-aa67-9dfa8a5ad686	85f95b14-5653-4595-8ff4-f1350019712b	eb56b5df-fd75-46c2-aef5-907d739b0fb5	SB	89.77	2026-04-06 22:00:00	Sanremo, Provincia di Imperia, Liguria, 18034, Italy	43.80862	7.76097	2026-04-19 17:28:57.053	2026-04-19 17:28:57.053
e962c675-af88-468c-87ae-aa35f5e2ae2b	85f95b14-5653-4595-8ff4-f1350019712b	f9a2592e-341b-4c6b-a8d8-f50619ffa31b	Ai Secoli Bui	120	2026-04-04 22:00:00	San Bartolomeo al Mare, Provincia di Imperia, Liguria, 18016, Italy	43.926823	8.098883	2026-04-19 17:33:44.616	2026-04-19 17:33:44.616
5d0dd184-3a46-41d8-a47e-9ff563338ffc	85f95b14-5653-4595-8ff4-f1350019712b	6a9688e3-40ca-450d-ad1e-1f69c8662644		10	2026-04-04 22:00:00	18016, San Bartolomeo al Mare, Provincia di Imperia, Liguria, Italy	43.926846	8.098835	2026-04-19 17:41:15.454	2026-04-19 17:41:15.454
2610a532-2925-4c0d-aa6e-def0c91ce1f9	85f95b14-5653-4595-8ff4-f1350019712b	46f1ce33-8b02-49ee-b3a6-1d9e02b859ba		4	2026-03-31 22:00:00	Big Mama, 10, Via Savona, Alessandria, Piedmont, 15121, Italy	44.90901	8.61201	2026-04-19 17:44:13.086	2026-04-19 17:44:13.086
c6cbe05f-86c8-4377-b6cb-9f509376bdf4	85f95b14-5653-4595-8ff4-f1350019712b	1b23321e-61fd-4c66-9274-80ef9427133a	Campo Rotondo	131.67	2026-04-04 22:00:00	Residence Campo Rotondo, 84, Via Provinciale, Crotto, Rovascio, Urago, Tavernerio, Como, Lombardy, 22038, Italy	45.795624	9.140883	2026-04-19 17:50:48.65	2026-04-19 17:50:48.65
ef387654-6f73-4001-b9b8-f1489e29d5b1	85f95b14-5653-4595-8ff4-f1350019712b	eb56b5df-fd75-46c2-aef5-907d739b0fb5		43.64	2026-04-05 22:00:00	Como, Lombardy, Italy	45.80208	9.141964	2026-04-19 17:54:22.319	2026-04-19 17:54:22.319
8f13c5fa-1ba8-4022-802f-415d04660093	85f95b14-5653-4595-8ff4-f1350019712b	c4ff36f9-1175-474a-a494-34977fae03e3	Pe de Montana	2.4	2026-03-30 22:00:00	Como, Lombardy, Italy	45.8104	9.073879	2026-04-19 17:20:20.365	2026-04-19 17:54:55.832
5a6679a1-c5a7-4e15-97f4-c0a0a15ef706	85f95b14-5653-4595-8ff4-f1350019712b	c4ff36f9-1175-474a-a494-34977fae03e3	Pe de montana	2.4	2026-04-05 22:00:00	Tavernerio, Como, Lombardy, 22038, Italy	45.810562	9.081891	2026-04-19 17:55:26.165	2026-04-19 17:55:26.165
\.


--
-- Data for Name: expense_person; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expense_person (expense_id, person_id) FROM stdin;
05b16c22-57c4-4a93-8101-80e494a8d034	519bb7f0-af92-423e-8056-27aa3860d1a7
05b16c22-57c4-4a93-8101-80e494a8d034	1f21a9e0-3d60-4a84-83a7-a2b863266be6
05b16c22-57c4-4a93-8101-80e494a8d034	c60bf5c4-9eba-43c5-b281-32614647aad3
05b16c22-57c4-4a93-8101-80e494a8d034	43b74160-3b1d-414b-aac2-da238600d56b
05b16c22-57c4-4a93-8101-80e494a8d034	d79249d5-1c42-426e-b0ba-43369c647b9f
5d0dd184-3a46-41d8-a47e-9ff563338ffc	1f21a9e0-3d60-4a84-83a7-a2b863266be6
\.


--
-- Data for Name: invitation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invitation (id, organization_id, email, role, status, expires_at, inviter_id) FROM stdin;
\.


--
-- Data for Name: jwks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jwks (created_at, id, private_key, public_key) FROM stdin;
2025-07-15 19:42:12.581	x38Zsp4v6Iaswu6qrfvFBVIPeawZfw1E	"3e0a6a92d17771999bb8be13cbd576987465ef8c3d437896904b56805caa6d04fe34b70b7f14b5c73e6f247feba6f71e05350c7108d4370457d0b3e91a30c382f91dba5f3cce2ce420e7a24f2ebae7f44687fbe02319d83118292c91bbb9dd5c0e69dc649de25301738d2be3a22bdf5f9bcf5889733d8f9254835ca3429c56fb395e4ae0e5d97f8d806a68d91fba9e08a1395cb22e9ae524695f907c0ef6a3dc16b7a1c9428c4d46a6"	{"crv":"Ed25519","x":"532bsanqXmV596duki9qJ1o6CeFypQPupHSO5EtGCCs","kty":"OKP"}
\.


--
-- Data for Name: member; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.member (id, organization_id, user_id, role, created_at) FROM stdin;
\.


--
-- Data for Name: organization; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organization (id, name, slug, logo, created_at, metadata) FROM stdin;
\.


--
-- Data for Name: passkey; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.passkey (id, name, public_key, user_id, credential_i_d, counter, device_type, backed_up, transports, created_at, aaguid) FROM stdin;
\.


--
-- Data for Name: person; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person (id, name, avatar_url, created_at, updated_at) FROM stdin;
1f21a9e0-3d60-4a84-83a7-a2b863266be6	Beno	\N	2026-04-12 19:12:54.826	2026-04-12 19:12:54.826
c60bf5c4-9eba-43c5-b281-32614647aad3	Kaio	\N	2026-04-12 19:13:01.845	2026-04-12 19:13:01.845
43b74160-3b1d-414b-aac2-da238600d56b	Katerinne	\N	2026-04-12 19:13:04.71	2026-04-12 19:13:04.71
d79249d5-1c42-426e-b0ba-43369c647b9f	Snoopy	\N	2026-04-12 19:13:11.006	2026-04-12 19:13:19.058
519bb7f0-af92-423e-8056-27aa3860d1a7	Barbara	\N	2026-04-12 19:12:59.12	2026-04-12 19:20:16.265
\.


--
-- Data for Name: s3_objects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.s3_objects (id, bucket, "fileName", "originalFileName", created_at, updated_at, "fileSize", created_by, updated_by) FROM stdin;
444	tes	test	test	2025-07-25 00:00:00	2025-07-25 00:00:00	1	sEFR7xO9IwcmSBgre0JinliQrvEnor0w	sEFR7xO9IwcmSBgre0JinliQrvEnor0w
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (id, expires_at, token, created_at, updated_at, ip_address, user_agent, user_id, impersonated_by, active_organization_id) FROM stdin;
8IyZ0EWMzQOREedPsGAAlzTFMqpDVuWb	2025-07-25 14:45:58.517	K8rRb4AXZK3irKz6LNjEHWDt3h08ZoQG	2025-07-15 19:13:46.59	2025-07-18 14:45:58.517		Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	sEFR7xO9IwcmSBgre0JinliQrvEnor0w	\N	\N
qvgEjW8mM1kCQlAijN7xa4f3Ll7gkZKc	2025-08-01 16:12:21.887	z5NeE93QWZMK5O6LusD1B4TVZXd53FtE	2025-07-25 16:12:21.888	2025-07-25 16:12:21.888		Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	sEFR7xO9IwcmSBgre0JinliQrvEnor0w	\N	\N
nSJOhh2pOgXaMW9WRj1RqIycg6919zAA	2025-09-12 21:56:50.206	QDBwrqhI5ktiUSmoMqnxr0OzVZC8gJMC	2025-09-05 21:56:50.207	2025-09-05 21:56:50.207		Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	sEFR7xO9IwcmSBgre0JinliQrvEnor0w	\N	\N
7kMb2FgK9NsLOogvEdBuwEkHMG5txixe	2025-10-22 16:09:03.007	8dedUBix979ZBr5B835KkF6MU0dffInd	2025-10-15 16:09:03.008	2025-10-15 16:09:03.008		Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	sEFR7xO9IwcmSBgre0JinliQrvEnor0w	\N	\N
207Zs50TwbbGxAuBI3x2bYCFXU1eSGbM	2025-12-13 08:59:55.165	PMqezcGjyMtQhgYipVIMFDInaoKeGlor	2025-12-06 08:59:55.165	2025-12-06 08:59:55.165		Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	sEFR7xO9IwcmSBgre0JinliQrvEnor0w	\N	\N
nXa5xLOY8rxZRUBIYebz4kvbVzD1MT70	2025-12-28 18:06:35.995	DY0yh7fzUnUfHYTAH2FWbeQstISPLphK	2025-12-21 18:06:35.996	2025-12-21 18:06:35.996		Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	sEFR7xO9IwcmSBgre0JinliQrvEnor0w	\N	\N
XZGq3quk9bgjNrbwrPuq28Xqi1OZj5EZ	2026-01-04 16:47:02.186	cJCF33yNeto3yZBjr07jnTGK2VArreBo	2025-12-28 16:47:02.186	2025-12-28 16:47:02.186	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	sEFR7xO9IwcmSBgre0JinliQrvEnor0w	\N	\N
gfE3mJqOlIQ5hFYVbcGKkj1k56YEfqMv	2026-03-16 20:56:12.285	sAJOltUBzzZiIicv2Fvk7kfaI3M25nbS	2026-03-09 20:56:12.286	2026-03-09 20:56:12.286	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	sEFR7xO9IwcmSBgre0JinliQrvEnor0w	\N	\N
rIW8gultvFS3GWw30u9YRBLnznBrT0Zd	2026-04-02 19:31:37.126	lmWvVA4lDc0uuYRkYXsF3RoXBeCMKm2U	2026-03-22 17:00:38.174	2026-03-26 19:31:37.126	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	sEFR7xO9IwcmSBgre0JinliQrvEnor0w	\N	\N
SdiCj5aY6nlyFYVU8zoHOzbTdtSM8TuJ	2026-04-21 21:43:38.873	ElIwKVmgJp9w7idisRzSqKcyMD1rbxnD	2026-04-12 10:19:01.56	2026-04-14 21:43:38.873	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	sEFR7xO9IwcmSBgre0JinliQrvEnor0w	\N	\N
Ga4IUOaCC1yxHdbr2ocOvJVLG8d7IWrX	2026-04-30 18:50:36.449	vuQ4Zp7x44E7Cc7bniTPwqf8WeW6BL4w	2026-04-16 18:03:43.428	2026-04-23 18:50:36.449	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	sEFR7xO9IwcmSBgre0JinliQrvEnor0w	\N	\N
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription (id, "userId", "subscriptionId", "customerId", "priceId", status, "currentPeriodEnd", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: trip; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trip (id, name, start_date, end_date, location_name, location_lat, location_lng, created_at, updated_at, cover_photo_url) FROM stdin;
d597de89-b24e-4871-bf3b-17326b51015a	Paris com Tia Edi	2026-01-22 23:00:00	2026-01-25 22:59:59.999	Rue des Martyrs, Quartier de Clignancourt, 18th Arrondissement, Paris, Ile-de-France, Metropolitan France, 75018, France	48.883938	2.3397384	2026-04-12 20:49:09.482	2026-04-12 20:50:29.174	\N
a62b1f34-4dd8-4052-bb65-611c81508347	MakerFaire 2025	2025-08-22 22:00:00	2025-08-24 21:59:59.999	28, Kamenzer Weg, Mittelfeld, D├Âhren-W├╝lfel, Hanover, Region Hannover, Lower Saxony, 30519, Germany	52.33304	9.786349	2026-04-12 20:54:00.637	2026-04-12 20:54:00.637	\N
b2b9459b-a227-4eb8-a289-1caaf3404915	Sardinien	2023-08-12 22:00:00	2023-08-24 21:59:59.999	Santa Maria Navarrese, Baunei, Ogliastra, Sardinia, 08040, Italy	39.989708	9.687267	2026-04-12 21:07:27.394	2026-04-12 21:07:27.394	\N
8feb020c-ceb6-4021-81a7-f5f8c4aaacf8	Framura	2022-08-07 22:00:00	2022-08-16 21:59:59.999	Via Luigi Duina, Vandarecca, Framura, La Spezia, Liguria, 19014, Italy	44.199085	9.559159	2026-04-12 21:19:13.164	2026-04-12 21:19:13.164	\N
4b11a21b-c9d1-4d6a-a876-3b095cbdb6b6	Holland	2022-04-14 22:00:00	2022-04-18 21:59:59.999	Recreatiepark De Voorst, 33, Leemringweg, Kraggenburg, Noordoostpolder, Flevoland, Netherlands, 8317 RD, Netherlands	52.67634	5.894678	2026-04-12 21:21:37.138	2026-04-12 21:21:37.138	\N
3a44fd31-2b7d-4f1c-b5de-6a737875bf3b	Sommer 2026	2026-08-11 22:00:00	2026-08-20 21:59:59.999	Via Franco Alfano, Sanremo, Provincia di Imperia, Liguria, 18014, Italy	43.812145	7.7557383	2026-04-12 20:47:18.584	2026-04-12 21:51:20.081	\N
85f95b14-5653-4595-8ff4-f1350019712b	Ostern 2026	2026-03-30 22:00:00	2026-04-06 21:59:59.999	Sanremo, Provincia di Imperia, Liguria, 18034, Italy	43.80862	7.76097	2026-04-12 20:30:37.042	2026-04-12 21:53:21.865	\N
a6cf17d3-b530-4faa-919f-08e89b723335	Sommer 2024 - Elba	2024-07-25 22:00:00	2024-08-07 21:59:59.999	1305, Viale dei Golfi, Lacona, Capoliveri, Livorno, Tuscany, 57031, Italy	42.76195	10.301256	2026-04-12 20:56:40.083	2026-04-12 21:56:04.193	\N
\.


--
-- Data for Name: trip_person; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trip_person (person_id, trip_id) FROM stdin;
1f21a9e0-3d60-4a84-83a7-a2b863266be6	d597de89-b24e-4871-bf3b-17326b51015a
43b74160-3b1d-414b-aac2-da238600d56b	d597de89-b24e-4871-bf3b-17326b51015a
519bb7f0-af92-423e-8056-27aa3860d1a7	d597de89-b24e-4871-bf3b-17326b51015a
1f21a9e0-3d60-4a84-83a7-a2b863266be6	a62b1f34-4dd8-4052-bb65-611c81508347
c60bf5c4-9eba-43c5-b281-32614647aad3	a62b1f34-4dd8-4052-bb65-611c81508347
43b74160-3b1d-414b-aac2-da238600d56b	a62b1f34-4dd8-4052-bb65-611c81508347
519bb7f0-af92-423e-8056-27aa3860d1a7	b2b9459b-a227-4eb8-a289-1caaf3404915
1f21a9e0-3d60-4a84-83a7-a2b863266be6	b2b9459b-a227-4eb8-a289-1caaf3404915
c60bf5c4-9eba-43c5-b281-32614647aad3	b2b9459b-a227-4eb8-a289-1caaf3404915
43b74160-3b1d-414b-aac2-da238600d56b	b2b9459b-a227-4eb8-a289-1caaf3404915
d79249d5-1c42-426e-b0ba-43369c647b9f	b2b9459b-a227-4eb8-a289-1caaf3404915
519bb7f0-af92-423e-8056-27aa3860d1a7	8feb020c-ceb6-4021-81a7-f5f8c4aaacf8
1f21a9e0-3d60-4a84-83a7-a2b863266be6	8feb020c-ceb6-4021-81a7-f5f8c4aaacf8
c60bf5c4-9eba-43c5-b281-32614647aad3	8feb020c-ceb6-4021-81a7-f5f8c4aaacf8
43b74160-3b1d-414b-aac2-da238600d56b	8feb020c-ceb6-4021-81a7-f5f8c4aaacf8
d79249d5-1c42-426e-b0ba-43369c647b9f	8feb020c-ceb6-4021-81a7-f5f8c4aaacf8
519bb7f0-af92-423e-8056-27aa3860d1a7	4b11a21b-c9d1-4d6a-a876-3b095cbdb6b6
1f21a9e0-3d60-4a84-83a7-a2b863266be6	4b11a21b-c9d1-4d6a-a876-3b095cbdb6b6
c60bf5c4-9eba-43c5-b281-32614647aad3	4b11a21b-c9d1-4d6a-a876-3b095cbdb6b6
43b74160-3b1d-414b-aac2-da238600d56b	4b11a21b-c9d1-4d6a-a876-3b095cbdb6b6
d79249d5-1c42-426e-b0ba-43369c647b9f	4b11a21b-c9d1-4d6a-a876-3b095cbdb6b6
1f21a9e0-3d60-4a84-83a7-a2b863266be6	3a44fd31-2b7d-4f1c-b5de-6a737875bf3b
c60bf5c4-9eba-43c5-b281-32614647aad3	3a44fd31-2b7d-4f1c-b5de-6a737875bf3b
43b74160-3b1d-414b-aac2-da238600d56b	3a44fd31-2b7d-4f1c-b5de-6a737875bf3b
d79249d5-1c42-426e-b0ba-43369c647b9f	3a44fd31-2b7d-4f1c-b5de-6a737875bf3b
519bb7f0-af92-423e-8056-27aa3860d1a7	3a44fd31-2b7d-4f1c-b5de-6a737875bf3b
1f21a9e0-3d60-4a84-83a7-a2b863266be6	85f95b14-5653-4595-8ff4-f1350019712b
c60bf5c4-9eba-43c5-b281-32614647aad3	85f95b14-5653-4595-8ff4-f1350019712b
43b74160-3b1d-414b-aac2-da238600d56b	85f95b14-5653-4595-8ff4-f1350019712b
d79249d5-1c42-426e-b0ba-43369c647b9f	85f95b14-5653-4595-8ff4-f1350019712b
519bb7f0-af92-423e-8056-27aa3860d1a7	85f95b14-5653-4595-8ff4-f1350019712b
1f21a9e0-3d60-4a84-83a7-a2b863266be6	a6cf17d3-b530-4faa-919f-08e89b723335
c60bf5c4-9eba-43c5-b281-32614647aad3	a6cf17d3-b530-4faa-919f-08e89b723335
43b74160-3b1d-414b-aac2-da238600d56b	a6cf17d3-b530-4faa-919f-08e89b723335
d79249d5-1c42-426e-b0ba-43369c647b9f	a6cf17d3-b530-4faa-919f-08e89b723335
519bb7f0-af92-423e-8056-27aa3860d1a7	a6cf17d3-b530-4faa-919f-08e89b723335
\.


--
-- Data for Name: two_factor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.two_factor (id, secret, backup_codes, user_id) FROM stdin;
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, name, email, email_verified, image, created_at, updated_at, role, banned, ban_reason, ban_expires, normalized_email, two_factor_enabled) FROM stdin;
sEFR7xO9IwcmSBgre0JinliQrvEnor0w	Sbrubbles Work	sbrubbles@sbrubbles.work	t	\N	2025-07-15 19:08:20.983	2026-04-12 15:32:13.392	user	\N	\N	\N	sbrubbles@sbrubbles.work	\N
\.


--
-- Data for Name: verification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.verification (id, identifier, value, expires_at, created_at, updated_at) FROM stdin;
jAP8FAP7vLp8LXRiXkYD621CqPHjikUf	4qICdk90J5Pi18iOnEM43EFm30H92eJf	{"expectedChallenge":"eJvmE25j4WRoCGjE3CQgMy-WzySI4mvP56hwDWEXbjk","userData":{"id":""}}	2025-12-28 16:36:25.857	2025-12-28 16:32:00.341	2025-12-28 16:32:00.341
i1524xn6LZ1pcQh6goH1JRzb03oRrcFv	dCdrGgWi6c2lOUhQdjkZMypfDyQ_hpAd	{"expectedChallenge":"4WNNt2CLU2Tc9ofZplmywhMP0vGA8JMIl7kP6qh-IhM","userData":{"id":""}}	2025-12-28 16:36:25.857	2025-12-28 16:32:10.097	2025-12-28 16:32:10.097
gqJajxCgzuy2h3q7i0cJjzEgbv0QtfoV	_1R-Kns4OgkIGRaU-eFOLi1r0o1Itoir	{"expectedChallenge":"Nch0CN0jV-zbq5g6NdOz70noLVhZM4269HgoEpDzlng","userData":{"id":""}}	2025-12-28 16:36:25.857	2025-12-28 16:32:19.502	2025-12-28 16:32:19.502
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: postgres
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: postgres
--

COPY storage.buckets_analytics (id, type, format, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: iceberg_namespaces; Type: TABLE DATA; Schema: storage; Owner: postgres
--

COPY storage.iceberg_namespaces (id, bucket_id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: iceberg_tables; Type: TABLE DATA; Schema: storage; Owner: postgres
--

COPY storage.iceberg_tables (id, namespace_id, bucket_id, name, location, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: postgres
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-07-15 18:53:33.702139
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-07-15 18:53:33.709913
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2025-07-15 18:53:33.713558
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-07-15 18:53:33.729176
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-07-15 18:53:33.735415
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-07-15 18:53:33.738622
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2025-07-15 18:53:33.743217
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-07-15 18:53:33.746929
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-07-15 18:53:33.750078
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2025-07-15 18:53:33.753541
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2025-07-15 18:53:33.757007
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-07-15 18:53:33.761816
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-07-15 18:53:33.766202
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-07-15 18:53:33.769537
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-07-15 18:53:33.772814
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-07-15 18:53:33.787205
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-07-15 18:53:33.791373
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-07-15 18:53:33.795406
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-07-15 18:53:33.799227
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-07-15 18:53:33.804376
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-07-15 18:53:33.809063
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-07-15 18:53:33.814072
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-07-15 18:53:33.82142
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-07-15 18:53:33.829473
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-07-15 18:53:33.832782
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2025-07-15 18:53:33.836408
26	objects-prefixes	ef3f7871121cdc47a65308e6702519e853422ae2	2025-07-15 18:53:33.839814
27	search-v2	33b8f2a7ae53105f028e13e9fcda9dc4f356b4a2	2025-07-15 18:53:33.848033
28	object-bucket-name-sorting	ba85ec41b62c6a30a3f136788227ee47f311c436	2025-07-15 18:53:33.855875
29	create-prefixes	a7b1a22c0dc3ab630e3055bfec7ce7d2045c5b7b	2025-07-15 18:53:33.861108
30	update-object-levels	6c6f6cc9430d570f26284a24cf7b210599032db7	2025-07-15 18:53:33.865618
31	objects-level-index	33f1fef7ec7fea08bb892222f4f0f5d79bab5eb8	2025-07-15 18:53:33.872363
32	backward-compatible-index-on-objects	2d51eeb437a96868b36fcdfb1ddefdf13bef1647	2025-07-15 18:53:33.879778
33	backward-compatible-index-on-prefixes	fe473390e1b8c407434c0e470655945b110507bf	2025-07-15 18:53:33.887598
34	optimize-search-function-v1	82b0e469a00e8ebce495e29bfa70a0797f7ebd2c	2025-07-15 18:53:33.889658
35	add-insert-trigger-prefixes	63bb9fd05deb3dc5e9fa66c83e82b152f0caf589	2025-07-15 18:53:33.894789
36	optimise-existing-functions	81cf92eb0c36612865a18016a38496c530443899	2025-07-15 18:53:33.900551
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2025-07-15 18:53:33.905755
38	iceberg-catalog-flag-on-buckets	19a8bd89d5dfa69af7f222a46c726b7c41e462c5	2025-07-15 18:53:33.909921
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: postgres
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata, level) FROM stdin;
\.


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: postgres
--

COPY storage.prefixes (bucket_id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: postgres
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: postgres
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: postgres
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 17, true);


--
-- Name: Page_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Page_id_seq"', 1, false);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: Page Page_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Page"
    ADD CONSTRAINT "Page_pkey" PRIMARY KEY (id);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: category category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_pkey PRIMARY KEY (id);


--
-- Name: expense_person expense_person_expense_id_person_id_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_person
    ADD CONSTRAINT expense_person_expense_id_person_id_pk PRIMARY KEY (expense_id, person_id);


--
-- Name: expense expense_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense
    ADD CONSTRAINT expense_pkey PRIMARY KEY (id);


--
-- Name: invitation invitation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitation
    ADD CONSTRAINT invitation_pkey PRIMARY KEY (id);


--
-- Name: jwks jwks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jwks
    ADD CONSTRAINT jwks_pkey PRIMARY KEY (id);


--
-- Name: member member_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member
    ADD CONSTRAINT member_pkey PRIMARY KEY (id);


--
-- Name: organization organization_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization
    ADD CONSTRAINT organization_pkey PRIMARY KEY (id);


--
-- Name: organization organization_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization
    ADD CONSTRAINT organization_slug_unique UNIQUE (slug);


--
-- Name: passkey passkey_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.passkey
    ADD CONSTRAINT passkey_pkey PRIMARY KEY (id);


--
-- Name: person person_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person
    ADD CONSTRAINT person_pkey PRIMARY KEY (id);


--
-- Name: s3_objects s3_objects_fileName_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.s3_objects
    ADD CONSTRAINT "s3_objects_fileName_unique" UNIQUE ("fileName");


--
-- Name: s3_objects s3_objects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.s3_objects
    ADD CONSTRAINT s3_objects_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: session session_token_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_token_unique UNIQUE (token);


--
-- Name: subscription subscription_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription
    ADD CONSTRAINT subscription_pkey PRIMARY KEY (id);


--
-- Name: trip_person trip_person_trip_id_person_id_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_person
    ADD CONSTRAINT trip_person_trip_id_person_id_pk PRIMARY KEY (trip_id, person_id);


--
-- Name: trip trip_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip
    ADD CONSTRAINT trip_pkey PRIMARY KEY (id);


--
-- Name: two_factor two_factor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.two_factor
    ADD CONSTRAINT two_factor_pkey PRIMARY KEY (id);


--
-- Name: user user_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_email_unique UNIQUE (email);


--
-- Name: user user_normalized_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_normalized_email_unique UNIQUE (normalized_email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: verification verification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification
    ADD CONSTRAINT verification_pkey PRIMARY KEY (id);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: postgres
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: postgres
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: iceberg_namespaces iceberg_namespaces_pkey; Type: CONSTRAINT; Schema: storage; Owner: postgres
--

ALTER TABLE ONLY storage.iceberg_namespaces
    ADD CONSTRAINT iceberg_namespaces_pkey PRIMARY KEY (id);


--
-- Name: iceberg_tables iceberg_tables_pkey; Type: CONSTRAINT; Schema: storage; Owner: postgres
--

ALTER TABLE ONLY storage.iceberg_tables
    ADD CONSTRAINT iceberg_tables_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: postgres
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: postgres
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: postgres
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: postgres
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: postgres
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: postgres
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: customerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "customerId_idx" ON public.subscription USING btree ("customerId");


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: postgres
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: postgres
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: idx_iceberg_namespaces_bucket_id; Type: INDEX; Schema: storage; Owner: postgres
--

CREATE UNIQUE INDEX idx_iceberg_namespaces_bucket_id ON storage.iceberg_namespaces USING btree (bucket_id, name);


--
-- Name: idx_iceberg_tables_namespace_id; Type: INDEX; Schema: storage; Owner: postgres
--

CREATE UNIQUE INDEX idx_iceberg_tables_namespace_id ON storage.iceberg_tables USING btree (namespace_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: postgres
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_name_bucket_level_unique; Type: INDEX; Schema: storage; Owner: postgres
--

CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: postgres
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: postgres
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: postgres
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: postgres
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: postgres
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: postgres
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: postgres
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: postgres
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: postgres
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();


--
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: postgres
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: postgres
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: postgres
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: account account_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: expense expense_category_id_category_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense
    ADD CONSTRAINT expense_category_id_category_id_fk FOREIGN KEY (category_id) REFERENCES public.category(id);


--
-- Name: expense_person expense_person_expense_id_expense_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_person
    ADD CONSTRAINT expense_person_expense_id_expense_id_fk FOREIGN KEY (expense_id) REFERENCES public.expense(id) ON DELETE CASCADE;


--
-- Name: expense_person expense_person_person_id_person_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_person
    ADD CONSTRAINT expense_person_person_id_person_id_fk FOREIGN KEY (person_id) REFERENCES public.person(id) ON DELETE CASCADE;


--
-- Name: expense expense_trip_id_trip_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense
    ADD CONSTRAINT expense_trip_id_trip_id_fk FOREIGN KEY (trip_id) REFERENCES public.trip(id) ON DELETE CASCADE;


--
-- Name: invitation invitation_inviter_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitation
    ADD CONSTRAINT invitation_inviter_id_user_id_fk FOREIGN KEY (inviter_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: invitation invitation_organization_id_organization_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitation
    ADD CONSTRAINT invitation_organization_id_organization_id_fk FOREIGN KEY (organization_id) REFERENCES public.organization(id) ON DELETE CASCADE;


--
-- Name: member member_organization_id_organization_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member
    ADD CONSTRAINT member_organization_id_organization_id_fk FOREIGN KEY (organization_id) REFERENCES public.organization(id) ON DELETE CASCADE;


--
-- Name: member member_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member
    ADD CONSTRAINT member_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: passkey passkey_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.passkey
    ADD CONSTRAINT passkey_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: s3_objects s3_objects_created_by_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.s3_objects
    ADD CONSTRAINT s3_objects_created_by_user_id_fk FOREIGN KEY (created_by) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: s3_objects s3_objects_updated_by_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.s3_objects
    ADD CONSTRAINT s3_objects_updated_by_user_id_fk FOREIGN KEY (updated_by) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: session session_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: subscription subscription_userId_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription
    ADD CONSTRAINT "subscription_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: trip_person trip_person_person_id_person_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_person
    ADD CONSTRAINT trip_person_person_id_person_id_fk FOREIGN KEY (person_id) REFERENCES public.person(id) ON DELETE CASCADE;


--
-- Name: trip_person trip_person_trip_id_trip_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_person
    ADD CONSTRAINT trip_person_trip_id_trip_id_fk FOREIGN KEY (trip_id) REFERENCES public.trip(id) ON DELETE CASCADE;


--
-- Name: two_factor two_factor_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.two_factor
    ADD CONSTRAINT two_factor_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: iceberg_namespaces iceberg_namespaces_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: postgres
--

ALTER TABLE ONLY storage.iceberg_namespaces
    ADD CONSTRAINT iceberg_namespaces_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_analytics(id) ON DELETE CASCADE;


--
-- Name: iceberg_tables iceberg_tables_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: postgres
--

ALTER TABLE ONLY storage.iceberg_tables
    ADD CONSTRAINT iceberg_tables_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_analytics(id) ON DELETE CASCADE;


--
-- Name: iceberg_tables iceberg_tables_namespace_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: postgres
--

ALTER TABLE ONLY storage.iceberg_tables
    ADD CONSTRAINT iceberg_tables_namespace_id_fkey FOREIGN KEY (namespace_id) REFERENCES storage.iceberg_namespaces(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: postgres
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: postgres
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: postgres
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: postgres
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: postgres
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: objects AuthUser can access and modify all files in the bucket 'private; Type: POLICY; Schema: storage; Owner: postgres
--

CREATE POLICY "AuthUser can access and modify all files in the bucket 'private" ON storage.objects TO "user" USING ((bucket_id = 'private-assets'::text));


--
-- Name: objects AuthUser can access and modify all files in the bucket 'public-; Type: POLICY; Schema: storage; Owner: postgres
--

CREATE POLICY "AuthUser can access and modify all files in the bucket 'public-" ON storage.objects TO "user" USING ((bucket_id = 'public-assets'::text));


--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: postgres
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: postgres
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: iceberg_namespaces; Type: ROW SECURITY; Schema: storage; Owner: postgres
--

ALTER TABLE storage.iceberg_namespaces ENABLE ROW LEVEL SECURITY;

--
-- Name: iceberg_tables; Type: ROW SECURITY; Schema: storage; Owner: postgres
--

ALTER TABLE storage.iceberg_tables ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: postgres
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: postgres
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: postgres
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: postgres
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: postgres
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;


--
-- Name: FUNCTION add_prefixes(_bucket_id text, _name text); Type: ACL; Schema: storage; Owner: postgres
--

GRANT ALL ON FUNCTION storage.add_prefixes(_bucket_id text, _name text) TO anon;
GRANT ALL ON FUNCTION storage.add_prefixes(_bucket_id text, _name text) TO authenticated;
GRANT ALL ON FUNCTION storage.add_prefixes(_bucket_id text, _name text) TO service_role;


--
-- Name: FUNCTION can_insert_object(bucketid text, name text, owner uuid, metadata jsonb); Type: ACL; Schema: storage; Owner: postgres
--

GRANT ALL ON FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) TO anon;
GRANT ALL ON FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) TO authenticated;
GRANT ALL ON FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) TO service_role;


--
-- Name: FUNCTION delete_prefix(_bucket_id text, _name text); Type: ACL; Schema: storage; Owner: postgres
--

GRANT ALL ON FUNCTION storage.delete_prefix(_bucket_id text, _name text) TO anon;
GRANT ALL ON FUNCTION storage.delete_prefix(_bucket_id text, _name text) TO authenticated;
GRANT ALL ON FUNCTION storage.delete_prefix(_bucket_id text, _name text) TO service_role;


--
-- Name: FUNCTION delete_prefix_hierarchy_trigger(); Type: ACL; Schema: storage; Owner: postgres
--

GRANT ALL ON FUNCTION storage.delete_prefix_hierarchy_trigger() TO anon;
GRANT ALL ON FUNCTION storage.delete_prefix_hierarchy_trigger() TO authenticated;
GRANT ALL ON FUNCTION storage.delete_prefix_hierarchy_trigger() TO service_role;


--
-- Name: FUNCTION enforce_bucket_name_length(); Type: ACL; Schema: storage; Owner: postgres
--

GRANT ALL ON FUNCTION storage.enforce_bucket_name_length() TO anon;
GRANT ALL ON FUNCTION storage.enforce_bucket_name_length() TO authenticated;
GRANT ALL ON FUNCTION storage.enforce_bucket_name_length() TO service_role;


--
-- Name: FUNCTION extension(name text); Type: ACL; Schema: storage; Owner: postgres
--

GRANT ALL ON FUNCTION storage.extension(name text) TO anon;
GRANT ALL ON FUNCTION storage.extension(name text) TO authenticated;
GRANT ALL ON FUNCTION storage.extension(name text) TO service_role;


--
-- Name: FUNCTION filename(name text); Type: ACL; Schema: storage; Owner: postgres
--

GRANT ALL ON FUNCTION storage.filename(name text) TO anon;
GRANT ALL ON FUNCTION storage.filename(name text) TO authenticated;
GRANT ALL ON FUNCTION storage.filename(name text) TO service_role;


--
-- Name: FUNCTION foldername(name text); Type: ACL; Schema: storage; Owner: postgres
--

GRANT ALL ON FUNCTION storage.foldername(name text) TO anon;
GRANT ALL ON FUNCTION storage.foldername(name text) TO authenticated;
GRANT ALL ON FUNCTION storage.foldername(name text) TO service_role;


--
-- Name: FUNCTION get_level(name text); Type: ACL; Schema: storage; Owner: postgres
--

GRANT ALL ON FUNCTION storage.get_level(name text) TO anon;
GRANT ALL ON FUNCTION storage.get_level(name text) TO authenticated;
GRANT ALL ON FUNCTION storage.get_level(name text) TO service_role;


--
-- Name: FUNCTION get_prefix(name text); Type: ACL; Schema: storage; Owner: postgres
--

GRANT ALL ON FUNCTION storage.get_prefix(name text) TO anon;
GRANT ALL ON FUNCTION storage.get_prefix(name text) TO authenticated;
GRANT ALL ON FUNCTION storage.get_prefix(name text) TO service_role;


--
-- Name: FUNCTION get_prefixes(name text); Type: ACL; Schema: storage; Owner: postgres
--

GRANT ALL ON FUNCTION storage.get_prefixes(name text) TO anon;
GRANT ALL ON FUNCTION storage.get_prefixes(name text) TO authenticated;
GRANT ALL ON FUNCTION storage.get_prefixes(name text) TO service_role;


--
-- Name: FUNCTION get_size_by_bucket(); Type: ACL; Schema: storage; Owner: postgres
--

GRANT ALL ON FUNCTION storage.get_size_by_bucket() TO anon;
GRANT ALL ON FUNCTION storage.get_size_by_bucket() TO authenticated;
GRANT ALL ON FUNCTION storage.get_size_by_bucket() TO service_role;


--
-- Name: FUNCTION list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text); Type: ACL; Schema: storage; Owner: postgres
--

GRANT ALL ON FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) TO anon;
GRANT ALL ON FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) TO authenticated;
GRANT ALL ON FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) TO service_role;


--
-- Name: FUNCTION list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text); Type: ACL; Schema: storage; Owner: postgres
--

GRANT ALL ON FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text) TO anon;
GRANT ALL ON FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text) TO authenticated;
GRANT ALL ON FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text) TO service_role;


--
-- Name: FUNCTION objects_insert_prefix_trigger(); Type: ACL; Schema: storage; Owner: postgres
--

GRANT ALL ON FUNCTION storage.objects_insert_prefix_trigger() TO anon;
GRANT ALL ON FUNCTION storage.objects_insert_prefix_trigger() TO authenticated;
GRANT ALL ON FUNCTION storage.objects_insert_prefix_trigger() TO service_role;


--
-- Name: FUNCTION objects_update_prefix_trigger(); Type: ACL; Schema: storage; Owner: postgres
--

GRANT ALL ON FUNCTION storage.objects_update_prefix_trigger() TO anon;
GRANT ALL ON FUNCTION storage.objects_update_prefix_trigger() TO authenticated;
GRANT ALL ON FUNCTION storage.objects_update_prefix_trigger() TO service_role;


--
-- Name: FUNCTION operation(); Type: ACL; Schema: storage; Owner: postgres
--

GRANT ALL ON FUNCTION storage.operation() TO anon;
GRANT ALL ON FUNCTION storage.operation() TO authenticated;
GRANT ALL ON FUNCTION storage.operation() TO service_role;


--
-- Name: FUNCTION prefixes_insert_trigger(); Type: ACL; Schema: storage; Owner: postgres
--

GRANT ALL ON FUNCTION storage.prefixes_insert_trigger() TO anon;
GRANT ALL ON FUNCTION storage.prefixes_insert_trigger() TO authenticated;
GRANT ALL ON FUNCTION storage.prefixes_insert_trigger() TO service_role;


--
-- Name: FUNCTION search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text); Type: ACL; Schema: storage; Owner: postgres
--

GRANT ALL ON FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) TO anon;
GRANT ALL ON FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) TO authenticated;
GRANT ALL ON FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) TO service_role;


--
-- Name: FUNCTION search_legacy_v1(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text); Type: ACL; Schema: storage; Owner: postgres
--

GRANT ALL ON FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) TO anon;
GRANT ALL ON FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) TO authenticated;
GRANT ALL ON FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) TO service_role;


--
-- Name: FUNCTION search_v1_optimised(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text); Type: ACL; Schema: storage; Owner: postgres
--

GRANT ALL ON FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) TO anon;
GRANT ALL ON FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) TO authenticated;
GRANT ALL ON FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) TO service_role;


--
-- Name: FUNCTION search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text); Type: ACL; Schema: storage; Owner: postgres
--

GRANT ALL ON FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text) TO anon;
GRANT ALL ON FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text) TO authenticated;
GRANT ALL ON FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text) TO service_role;


--
-- Name: FUNCTION update_updated_at_column(); Type: ACL; Schema: storage; Owner: postgres
--

GRANT ALL ON FUNCTION storage.update_updated_at_column() TO anon;
GRANT ALL ON FUNCTION storage.update_updated_at_column() TO authenticated;
GRANT ALL ON FUNCTION storage.update_updated_at_column() TO service_role;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: postgres
--

GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO service_role;


--
-- Name: TABLE buckets_analytics; Type: ACL; Schema: storage; Owner: postgres
--

GRANT ALL ON TABLE storage.buckets_analytics TO anon;
GRANT ALL ON TABLE storage.buckets_analytics TO authenticated;
GRANT ALL ON TABLE storage.buckets_analytics TO service_role;


--
-- Name: TABLE iceberg_namespaces; Type: ACL; Schema: storage; Owner: postgres
--

GRANT ALL ON TABLE storage.iceberg_namespaces TO service_role;
GRANT SELECT ON TABLE storage.iceberg_namespaces TO authenticated;
GRANT SELECT ON TABLE storage.iceberg_namespaces TO anon;


--
-- Name: TABLE iceberg_tables; Type: ACL; Schema: storage; Owner: postgres
--

GRANT ALL ON TABLE storage.iceberg_tables TO service_role;
GRANT SELECT ON TABLE storage.iceberg_tables TO authenticated;
GRANT SELECT ON TABLE storage.iceberg_tables TO anon;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: postgres
--

GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO service_role;


--
-- Name: TABLE prefixes; Type: ACL; Schema: storage; Owner: postgres
--

GRANT ALL ON TABLE storage.prefixes TO anon;
GRANT ALL ON TABLE storage.prefixes TO authenticated;
GRANT ALL ON TABLE storage.prefixes TO service_role;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: postgres
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: postgres
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- PostgreSQL database dump complete
--

