(function () {
'use strict';
const AC = window.AC;
for (const o of window.AC_OWN || []) AC.Ind.addOwn(o.id, o.name, o.code);
const app = window.AmatuChart = new AC.App();
app.start();
})();
