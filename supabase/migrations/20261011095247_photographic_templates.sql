-- Extend the allowed designs without changing portfolio ownership or visibility.
begin;
alter table public.portfolios drop constraint portfolios_theme_id_check;
alter table public.portfolios add constraint portfolios_theme_id_check
  check (theme_id in ('editorial','bento','motion','quest','studio','monograph','portrait','atelier','cinema','ember','halo'));
commit;
