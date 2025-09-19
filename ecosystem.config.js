module.exports = {
  apps : [
  { name   : "atualiza3009", script : "./atualiza.js",  stop_exit_codes: [0] },
  { name   : "extra", script : "./extra.js",  stop_exit_codes: [0] },
  { name   : "atualiza3050", script : "./atualiza.js",   args   : "0 --max-old-space-size=12000",  stop_exit_codes: [0], log_date_format: "YYYY-MM-DD HH:mm Z"},
  { name   : "atualiza3051", script : "./atualiza.js",   args   : "1 --max-old-space-size=12000",  stop_exit_codes: [0]},
  { name   : "atualiza3052", script : "./atualiza.js",   args   : "2 --max-old-space-size=12000",  stop_exit_codes: [0]},
  { name   : "atualiza3053", script : "./atualiza.js",   args   : "3 --max-old-space-size=12000",  stop_exit_codes: [0]},
  { name   : "atualiza3054", script : "./atualiza.js",   args   : "4 --max-old-space-size=12000",  stop_exit_codes: [0]},
  { name   : "atualiza3055", script : "./atualiza.js",   args   : "5 --max-old-space-size=12000",  stop_exit_codes: [0]},
  { name   : "atualiza3056", script : "./atualiza.js",   args   : "6 --max-old-space-size=12000",  stop_exit_codes: [0]},
  { name   : "atualiza3057", script : "./atualiza.js",   args   : "7 --max-old-space-size=12000",  stop_exit_codes: [0]},
  { name   : "atualiza3058", script : "./atualiza.js",   args   : "8 --max-old-space-size=12000",  stop_exit_codes: [0]},
  { name   : "atualiza3059", script : "./atualiza.js",   args   : "9 --max-old-space-size=12000",  stop_exit_codes: [0]},
  { name   : "externoCalcs", script : "./externoCalcs.js"},
  { name   : "www6", script : "./www6.js"},
  { name   : "c_main", script : "./c_main.js",   args   : "--max-old-space-size=12000"},
  // { name   : "calculosDiversos", script : "./calculosDiversos.js"},
  { name   : "cron-2", script : "./cron-2.js"},
  ]
}