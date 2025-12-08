// script.js
let config = null;
let selected = null;

const headSelect = document.getElementById('headSelect');
const armorSelect = document.getElementById('armorSelect');
const labelInit = document.getElementById('labelInit');
const labelSell = document.getElementById('labelSell');
const cur = document.getElementById('cur');
const max = document.getElementById('max');

const resultMax = document.getElementById('resultMax');
const innerSell = document.getElementById('innerSell');
const innerBringOut = document.getElementById('innerBringOut');
const outerResult = document.getElementById('outerResult');
const outerSell = document.getElementById('outerSell');

const c1 = document.getElementById('c1');
const c2 = document.getElementById('c2');
const c3 = document.getElementById('c3');
const c4 = document.getElementById('c4');

async function loadConfig(){
  const r = await fetch('config.json');
  config = await r.json();
  // 填充选择框 (只显示 id，之后可改为名字)
  config.head.forEach(h => headSelect.insertAdjacentHTML('beforeend', `<option value="${h.id}">${h.id}</option>`));
  config.armor.forEach(a => armorSelect.insertAdjacentHTML('beforeend', `<option value="${a.id}">${a.id}</option>`));
}
loadConfig();

headSelect.onchange = function(){
  armorSelect.value = "";
  selected = config.head.find(x => String(x.id) === this.value) || null;
  updateLabels();
  calc();
}
armorSelect.onchange = function(){
  headSelect.value = "";
  selected = config.armor.find(x => String(x.id) === this.value) || null;
  updateLabels();
  calc();
}

cur.oninput = max.oninput = calc;

function clearOutputs(){
  resultMax.innerText = '';
  innerSell.innerText = '';
  innerBringOut.innerText = '';
  outerResult.innerText = '';
  outerSell.innerText = '';
  c1.innerText = c2.innerText = c3.innerText = c4.innerText = '';
}

function updateLabels(){
  if (!selected){
    labelInit.innerText = '-';
    labelSell.innerText = '-';
    clearOutputs();
    return;
  }
  labelInit.innerText = selected.init;
  labelSell.innerText = selected.sell;
}

function calc(){
  clearOutputs();
  if (!selected) return;
  if (!cur.value || !max.value) return;

  const 当前耐久上限 = Number(max.value);
  const 当前耐久 = Number(cur.value);
  const 初始上限 = Number(selected.init);
  const 维修损耗 = Number(selected.loss);

  // a = 当前耐久上限 - 当前耐久
  const a = 当前耐久上限 - 当前耐久;

  // b = a / 当前耐久上限
  const b = a / 当前耐久上限;

  // c = 当前耐久上限 / 初始上限
  const c = 当前耐久上限 / 初始上限;

  // d = ln(c) / ln(10)
  const d = Math.log(c) / Math.log(10);

  // e = 当前耐久上限 - 当前耐久上限 * b * (维修损耗 - d)
  const e = 当前耐久上限 - 当前耐久上限 * b * (维修损耗 - d);

  // 维修后耐久上限（局内维修结果） 四舍五入到 0.1
  const 维修后耐久上限 = Number(Math.round(e * 10) / 10);
  resultMax.innerText = isFinite(维修后耐久上限) ? 维修后耐久上限 : '';

  if (isFinite(维修后耐久上限)) {
    // 局内带出耐久 = 取整(维修后耐久上限)
    const 局内维修后带出耐久 = Math.floor(维修后耐久上限);
    innerBringOut.innerText = 局内维修后带出耐久;

    // 可出售判断：局内带出耐久 >= sell 则可出售
    if (局内维修后带出耐久 >= selected.sell) {
      innerSell.innerText = '可出售';
      innerSell.style.color = 'var(--good)';
    } else {
      innerSell.innerText = '不可出售';
      innerSell.style.color = 'var(--bad)';
    }

    // 维修耐久差值 = 维修后耐久上限 - 当前耐久
    const 维修耐久差值 = 维修后耐久上限 - 当前耐久;

    // 消耗维修包点数 = 差值 ÷ 维修倍率X (四个)
    // 如果差值为负（已经高于维修后上限），显示 0
    const diff = 维修耐久差值 > 0 ? 维修耐久差值 : 0;
    c1.innerText = (diff / selected.m1).toFixed(1);
    c2.innerText = (diff / selected.m2).toFixed(1);
    c3.innerText = (diff / selected.m3).toFixed(1);
    c4.innerText = (diff / selected.m4).toFixed(1);
  }

  // 局外维修计算（先取整当前耐久上限：原代码中用取整）
  const 当前耐久上限取整 = Math.floor(当前耐久上限);
  const f = 当前耐久上限取整 - 当前耐久;            // f
  const g = 当前耐久上限取整 === 0 ? 0 : f / 当前耐久上限取整; // g
  const h = 当前耐久上限取整 / 初始上限;            // h
  const i = Math.log(h) / Math.log(10);              // i
  const j = 维修损耗 - i;                            // j

  let 局外维修后耐久 = 0;
  if (当前耐久上限取整 > 0) {
    局外维修后耐久 = Math.floor(当前耐久上限取整 - 当前耐久上限取整 * g * j);
    outerResult.innerText = 局外维修后耐久;
    if (局外维修后耐久 >= selected.sell) {
      outerSell.innerText = '可出售';
      outerSell.style.color = 'var(--good)';
    } else {
      outerSell.innerText = '不可出售';
      outerSell.style.color = 'var(--bad)';
    }
  } else {
    outerResult.innerText = '';
    outerSell.innerText = '';
  }
}
