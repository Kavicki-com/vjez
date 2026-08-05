-- Sem unicidade em `hr`, um `on conflict do nothing` não protege nada e o
-- dicionário aceita a mesma palavra duas vezes em silêncio — foi o que
-- aconteceu com "trg". Uma entrada por verbete; sentidos diferentes cabem
-- em nota_pt, como já é feito em "riba" e "zima".

-- Mantém a linha mais antiga de cada verbete repetido.
delete from public.lex_items a
using public.lex_items b
where a.hr = b.hr
  and a.criado_em > b.criado_em;

alter table public.lex_items add constraint lex_items_hr_unico unique (hr);
