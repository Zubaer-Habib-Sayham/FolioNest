begin;
alter table public.portfolios drop constraint portfolios_theme_id_check;
alter table public.portfolios add constraint portfolios_theme_id_check
  check (theme_id in ('editorial', 'bento', 'motion', 'quest', 'studio'));
commit;
