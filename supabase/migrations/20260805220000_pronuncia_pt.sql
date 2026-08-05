-- Pronúncia aproximada para ouvido brasileiro, em respelling silábico com
-- a sílaba tônica em MAIÚSCULA — "VÓ-da", "KU-tcha".
--
-- Não é AFI de propósito: o público é iniciante em croata e AFI exigiria
-- aprender um segundo alfabeto antes de aprender o primeiro.
alter table public.lex_items add column pronuncia_pt text;
alter table public.frases    add column pronuncia_pt text;
alter table public.numeros   add column pronuncia_pt text;
