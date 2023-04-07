import { BlockTranslater } from '/static/Am-logic/Am-interperter/Am-translater/pyTranslater.js';
$(document).ready(function(){
    let blockTranslater = new BlockTranslater();
    const block=blockTranslater.convertToBlock(code)
    $(`#${block[0].kind}`).click();
    const clone = $(`#Am-workspace #${block[0].kind}`)
    clone.find('.Am-edit .Am-text').text(block[0].printValue)
    clone.find('.Am-edit').click();
    console.log(clone.find('#flex'))
    $('#flex').trigger({
        type: 'keydown',
        which: 65
      });
});