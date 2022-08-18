insert into presences (id, time_in, time_out, activity_id, employee_id, description, created_at)
SELECT gen_random_uuid() id
, t.day::date + '06:15:00' ::time time_in
, t.day::date + '16:45:00' ::time time_out
, '02d5b9cc-1a1c-43a2-9bbb-2e291e7a6e90' activity_id
, '12e6c4b9-2942-4870-b48c-4b4a93eee52b' employee_id
, 'lutfidmz' description
, now() :: timestamp created_at
--, extract(isodow from t.day::date) day_of_week
FROM  generate_series(timestamp '2022-07-25'
					, timestamp '2022-08-24'
					, interval  '1 day') AS t(day)
where extract(isodow from t.day::date) < 6 
and t.day::date not in (select time_in::date 
						from presences p 
						where p.activity_id = '02d5b9cc-1a1c-43a2-9bbb-2e291e7a6e90' --kbm
						and p.employee_id  = '12e6c4b9-2942-4870-b48c-4b4a93eee52b' --lutfi
						and time_in between '2022-07-25' and '2022-08-24'
						) -- tanggal yang sudah ada presensi nya
and t.day::date not in ('2022-08-19') -- hari libur