// ============================================================
//  Shared helpers for the championship
//  · language · team names · points · results · Google Sheet
//  Points are always added up by TEAM NAME, on any device.
// ============================================================
(function () {
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  // ── POINTS ─────────────────────────────────────────────
  //  Every challenge gives at most 100 points.
  //  Timed challenges: [max seconds (total time, penalties included), points].
  //  Adjust the bands after the first sessions if they are too easy or too hard.
  const POINTS = {
    ezagutu:  { byCorrect: true },                 // no clock: 100 × correct / questions
    bolak:    { bands: [[60, 100], [90, 80], [120, 60], [180, 40]], rest: 20 },
    steam:    { bands: [[240, 100], [360, 80], [480, 60], [660, 40]], rest: 20 },
    duel:     { win: 100, tie: 70, lose: 40 }     // sokatira + balioak
  };
  const DUELS = ['sokatira', 'balioak'];
  const COLORS = { L: '#5b3cc4', R: '#0b9a6d' };

  const S = {
    back:     { eu: '← Txapelketa', es: '← Torneo', en: '← Championship' },
    nameQ1:   { eu: 'Idatzi zuen taldearen izena', es: 'Escribid el nombre de vuestro equipo', en: 'Type your team name' },
    nameQ2:   { eu: 'Idatzi bi taldeen izenak', es: 'Escribid los nombres de los dos equipos', en: 'Type both team names' },
    nameHint: { eu: 'Erabili beti izen bera, puntuak zuen taldeari gehitzeko.', es: 'Usad siempre el mismo nombre para que los puntos se sumen a vuestro equipo.', en: 'Always use the same name so the points go to your team.' },
    left:     { eu: 'Ezkerreko taldea', es: 'Equipo de la izquierda', en: 'Left team' },
    right:    { eu: 'Eskuineko taldea', es: 'Equipo de la derecha', en: 'Right team' },
    team:     { eu: 'Taldearen izena', es: 'Nombre del equipo', en: 'Team name' },
    group:    { eu: 'Gela / zikloa (aukerakoa)', es: 'Clase / ciclo (opcional)', en: 'Class / course (optional)' },
    known:    { eu: '✓ Talde ezaguna', es: '✓ Equipo conocido', en: '✓ Known team' },
    newTeam:  { eu: '⚠ Talde berria: egiaztatu izena ondo idatzita dagoela', es: '⚠ Equipo nuevo: comprobad que el nombre está bien escrito', en: '⚠ New team: check the name is spelled correctly' },
    sameName: { eu: 'Bi taldeek izen desberdina behar dute.', es: 'Los dos equipos necesitan nombres distintos.', en: 'The two teams need different names.' },
    emptyName:{ eu: 'Idatzi taldearen izena hasteko.', es: 'Escribid el nombre del equipo para empezar.', en: 'Type the team name to start.' },
    start:    { eu: 'Hasi', es: 'Empezar', en: 'Start' },
    saved:    { eu: '✓ Puntuak txapelketan gordeta', es: '✓ Puntos guardados en el torneo', en: '✓ Points saved to the championship' },
    savedLocal: { eu: '✓ Puntuak ordenagailu honetan gordeta (Sheet-a konektatu gabe)', es: '✓ Puntos guardados en este ordenador (hoja sin conectar)', en: '✓ Points saved on this computer (sheet not connected)' },
    otherTeam: { eu: 'Hurrengo taldea', es: 'Siguiente equipo', en: 'Next team' },
    toHub:    { eu: 'Txapelketara itzuli', es: 'Volver al torneo', en: 'Back to the championship' },
    time:     { eu: 'Denbora', es: 'Tiempo', en: 'Time' },
    penalty:  { eu: 'Zigorra', es: 'Penalización', en: 'Penalty' },
    total:    { eu: 'Denbora guztira', es: 'Tiempo total', en: 'Total time' },
    correct:  { eu: 'Zuzenak', es: 'Correctas', en: 'Correct' },
    wrong:    { eu: 'Okerrak', es: 'Fallos', en: 'Mistakes' },
    points:   { eu: 'Puntuak', es: 'Puntos', en: 'Points' },
    pts:      { eu: 'puntu', es: 'puntos', en: 'points' },
    games: {
      ezagutu:  { eu: 'Ezagutu Don Bosco', es: 'Conoce Don Bosco', en: 'Discover Don Bosco' },
      bolak:    { eu: 'Paretako bolak', es: 'Bolas en la pared', en: 'Wall balls' },
      sokatira: { eu: 'Soka-tira: AA', es: 'Tira y afloja: IA', en: 'Tug of war: AI' },
      steam:    { eu: 'STEAM erronka', es: 'Reto STEAM', en: 'STEAM challenge' },
      balioak:  { eu: 'Balioak 4.0 dueloa', es: 'Duelo Valores 4.0', en: 'Values 4.0 duel' }
    }
  };

  /** Same key for "Tximistak", " tximistak " and "TXIMISTAK" */
  function key(name) {
    return String(name || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
  }
  function clean(name) { return String(name || '').replace(/\s+/g, ' ').trim().slice(0, 30); }

  let knownCache = null;

  window.DB = {
    S, POINTS, DUELS, COLORS, key, clean,
    get lang() { return LS.get('db-lang', 'eu'); },
    set lang(l) { LS.set('db-lang', l); },
    t(o) { return (o && (o[this.lang] ?? o.eu)) || ''; },

    /** The team registered on this device (hub page) */
    myTeam() { return LS.get('db-team', null); },
    setMyTeam(t) { LS.set('db-team', t); },

    points(game, rec) {
      if (DUELS.includes(game)) return POINTS.duel[rec.result] ?? 0;
      const p = POINTS[game]; if (!p) return 0;
      if (p.byCorrect) return Math.round(100 * (rec.correct || 0) / Math.max(1, (rec.correct || 0) + (rec.wrong || 0)));
      for (const [max, pts] of p.bands) if (rec.total <= max) return pts;
      return p.rest;
    },

    // ── Local results (used when the Sheet is not connected) ──
    results() { return LS.get('db-results', []); },
    localTeams() {
      const teams = {};
      this.results().forEach(r => {
        const k = key(r.teamName); if (!k) return;
        const tm = teams[k] || (teams[k] = { team: r.teamName, group: r.group || '', games: {} });
        tm.games[r.game] = Math.max(tm.games[r.game] || 0, r.points || 0);
      });
      return Object.values(teams).map(tm => Object.assign(tm, {
        points: Object.values(tm.games).reduce((a, b) => a + b, 0), played: Object.keys(tm.games).length
      })).sort((a, b) => b.points - a.points);
    },

    /** rec: { game, teamName, group?, rival?, time, wrong, correct, penalty, total, result } */
    saveResult(rec) {
      rec.teamName = clean(rec.teamName);
      if (rec.points == null) rec.points = this.points(rec.game, rec);
      if (rec.rival) rec.rival = clean(rec.rival);
      const full = Object.assign({ date: new Date().toISOString(), group: '', lang: this.lang }, rec);
      const all = this.results(); all.push(full); LS.set('db-results', all.slice(-2000));
      const url = (window.DB_CONFIG || {}).SCRIPT_URL;
      if (url) {
        fetch(url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(full) }).catch(() => {});
        return 'sheet';
      }
      return 'local';
    },

    fmt(sec) { sec = Math.max(0, Math.round(sec)); return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); },

    /** Read data from the Apps Script web app (JSONP, works from GitHub Pages) */
    jsonp(params, cb) {
      const url = (window.DB_CONFIG || {}).SCRIPT_URL;
      if (!url) { cb(null); return; }
      const name = 'dbcb' + Date.now() + Math.floor(Math.random() * 1e4);
      const s = document.createElement('script');
      const timer = setTimeout(() => { cleanup(); cb(null); }, 10000);
      function cleanup() { clearTimeout(timer); try { delete window[name]; } catch (e) { window[name] = undefined; } s.remove(); }
      window[name] = d => { cleanup(); cb(d); };
      s.src = url + '?' + new URLSearchParams(Object.assign({ callback: name }, params));
      s.onerror = () => { cleanup(); cb(null); };
      document.head.appendChild(s);
    },

    /** Ranking of all teams: from the Sheet if connected, otherwise from this computer. cb(list, source) */
    ranking(cb) {
      if (!(window.DB_CONFIG || {}).SCRIPT_URL) { cb(this.localTeams(), 'local'); return; }
      this.jsonp({ action: 'ranking' }, d => {
        if (d && d.ok) { knownCache = d.teams.map(x => x.team); cb(d.teams, 'sheet'); }
        else cb(this.localTeams(), 'fail');
      });
    },

    /** Known team names (for suggestions) */
    knownTeams(cb) {
      if (!(window.DB_CONFIG || {}).SCRIPT_URL) return cb(this.localTeams().map(x => x.team));
      if (knownCache) return cb(knownCache);
      this.ranking(list => { knownCache = list.map(x => x.team); cb(knownCache); });
    },

    /**
     * Name form shown before every game.
     * opts: { count: 1|2, prefill: [..], button?: {eu,es,en} }  → onReady([name] or [left, right], groups)
     * Known names are suggested; a new name shows a warning and an optional class field.
     */
    nameForm(container, opts, onReady) {
      const n = opts.count || 1;
      const labels = n === 1 ? [S.team] : [S.left, S.right];
      container.innerHTML = `<p class="db-q"></p><div class="db-names"></div><p class="db-hint"></p><p class="db-err"></p><button class="db-go"></button>
        <datalist id="db-known"></datalist>`;
      container.querySelector('.db-q').textContent = this.t(n === 1 ? S.nameQ1 : S.nameQ2);
      container.querySelector('.db-hint').textContent = this.t(S.nameHint);
      container.querySelector('.db-go').textContent = this.t(opts.button || S.start) + ' ▸';
      const box = container.querySelector('.db-names');
      const inputs = labels.map((lab, i) => {
        const f = document.createElement('label');
        f.className = 'db-field';
        if (n === 2) f.style.setProperty('--c', i ? COLORS.R : COLORS.L);
        f.innerHTML = '<span></span><input maxlength="30" list="db-known" autocomplete="off"><small></small><input class="db-grp" maxlength="30" autocomplete="off" hidden>';
        f.querySelector('.db-grp').placeholder = this.t(S.group);
        f.querySelector('span').textContent = this.t(lab);
        const inp = f.querySelector('input');
        inp.value = (opts.prefill && opts.prefill[i]) || '';
        box.appendChild(f);
        return inp;
      });
      let known = [];
      const check = () => inputs.forEach(inp => {
        const v = key(inp.value), small = inp.nextElementSibling;
        const grp = inp.parentNode.querySelector('.db-grp');
        if (!v || !known.length) { small.textContent = ''; small.className = ''; grp.hidden = true; return; }
        const ok = known.some(k => key(k) === v);
        small.textContent = this.t(ok ? S.known : S.newTeam);
        small.className = ok ? 'ok' : 'new';
        grp.hidden = ok;
      });
      inputs.forEach(i => i.addEventListener('input', check));
      // use the stored spelling of a known team ("tximistak" → "Tximistak")
      const canon = v => (known.find(k => key(k) === key(v)) || clean(v));
      this.knownTeams(list => {
        known = list || [];
        container.querySelector('#db-known').innerHTML = known.map(k => `<option></option>`).join('');
        container.querySelectorAll('#db-known option').forEach((o, i) => o.value = known[i]);
        check();
      });
      const err = container.querySelector('.db-err');
      const go = () => {
        const names = inputs.map(i => canon(i.value));
        if (names.some(x => !x)) { err.textContent = this.t(S.emptyName); return; }
        if (n === 2 && key(names[0]) === key(names[1])) { err.textContent = this.t(S.sameName); return; }
        err.textContent = '';
        const groups = inputs.map(i => { const g = i.parentNode.querySelector('.db-grp'); return g.hidden ? '' : clean(g.value); });
        onReady(names, groups);
      };
      container.querySelector('.db-go').onclick = go;
      inputs.forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') go(); }));
      setTimeout(() => (inputs.find(i => !i.value) || inputs[0]).focus(), 50);
    },

    hub: '../index.html'
  };

  // Base styles for the name form (shared by all games)
  const css = document.createElement('style');
  css.textContent = `
    .db-q { font-weight: 800; font-size: 1.2rem; margin-top: 20px; }
    .db-names { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 10px; }
    .db-field { flex: 1; min-width: 220px; display: flex; flex-direction: column; gap: 6px; }
    .db-field span { font-weight: 700; font-size: 0.95rem; color: var(--c, #555); }
    .db-field input { box-sizing: border-box; }
    .db-field input { font-family: inherit; font-size: 1.35rem; font-weight: 700; padding: 13px 16px; border-radius: 14px;
      border: 3px solid var(--c, #c9ced8); color: #1b1d33; background: #fff; width: 100%; }
    .db-field .db-grp { font-size: 1rem; font-weight: 600; padding: 9px 14px; border-width: 2px; }
    .db-field small { min-height: 1.2em; font-size: 0.9rem; font-weight: 600; }
    .db-field small.ok { color: #15803d; } .db-field small.new { color: #b45309; }
    .db-hint { color: #6b7280; font-size: 0.95rem; margin-top: 4px; }
    .db-err { color: #dc2626; font-weight: 700; min-height: 1.3em; margin-top: 6px; }
    .db-go { margin-top: 8px; border: none; border-radius: 999px; background: #1b1d33; color: #fff; font-family: inherit; font-weight: 800; font-size: 1.3rem; padding: 15px 44px; cursor: pointer; }
    .db-go:focus-visible, .db-field input:focus-visible { outline: 4px solid #ffc20e; outline-offset: 3px; }
  `;
  document.head.appendChild(css);
})();
