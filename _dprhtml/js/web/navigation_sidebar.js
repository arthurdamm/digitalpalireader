'use strict';

var DPRNav = {
  changeSet: async function (nik) {
    __navigationTabViewModel.set(nik);

    const prevSet = DPR_G.G_numberToNik[__navigationTabViewModel.prevSetIndex]
    if (DPR_G.G_hier == 't' && this.limitt(DPR_G.G_nikToNumber2[__navigationTabViewModel.set()])) {
      DPR_Chrome.showErrorToast('Ṭīkā not available for ' + DPR_G.G_nikLongName[__navigationTabViewModel.set()] + '.')
      __navigationTabViewModel.set(prevSet);
      return;
    }
    if (DPR_G.G_hier == 'a' && __navigationTabViewModel.set() == 'g') {
      DPR_Chrome.showErrorToast('Atthakatha not available for Gram.')
      __navigationTabViewModel.set(prevSet);
      return;
    }
    if (DPR_G.G_hier == 'a' && __navigationTabViewModel.set() == 'b') {
      DPR_Chrome.showErrorToast('Atthakatha not available for Abhidh-s.');
      __navigationTabViewModel.set(prevSet);
      return;
    }

    __navigationTabViewModel.prevSetIndex = DPR_G.G_nikToNumber2[nik];

    this.setBookList(nik);
  },

  getBookName: function (nik, ht, no) { // nik is nikaya, ht is a DPR_G.G_hier, no will be xml no - 1
    if (Object.keys(DPR_G.G_kynames).includes(nik)) {
      no = DPR_G.G_kynames[nik][no];
      if (ht != 'm') no = no.replace(/([^a]) 1$/, '$1');
    }
    else no++;
    return no.toString();
  },

  setBookList: function (nik, book) {
    var titles;
    if (DPR_G.nikvoladi[nik]) titles = DPR_G.nikvoladi[nik];
    else titles = DPR_G.nikvoladi[nik+DPR_G.G_hier];
    __navigationTabViewModel.navBook.removeAll();

    for (var i = 0; i < titles.length; i++) {
      var title;
      var val;
      if(Object.keys(DPR_G.G_kynames).includes(nik)) {
        title = DPR_G.G_kynames[nik][titles[i]];
        val = titles[i]+1;
      }
      else {
        title = titles[i];
        val = i+1;
      }
      __navigationTabViewModel.navBook.push({value: val, label: DPR_translit_mod.translit(title)});
    }

    __navigationTabViewModel.book(book ? book : __navigationTabViewModel.navBook()[0].value);
  },

  limitt: function (nikn) {
    if (nikn == 5 || nikn > 6) { return true; }
    else { return false };
  },

  setSearchBookList: async function () {
    const nik = $('#tsoSETm').val();

    const titles = DPR_G.nikvoladi[nik] ? DPR_G.nikvoladi[nik] : DPR_G.nikvoladi[nik + $('#tsoMAT2m').val()];

    __searchTabViewModel.bookListA.removeAll();
    __searchTabViewModel.bookListB.removeAll();
    __searchTabViewModel.bookMenu.removeAll();
    for (var i = 0; i < titles.length; i++) {
      // menu
      let menuValue = ((nik == 'k' || nik == 'y' || nik == 'n') ? (titles[i] + 1) : (i + 1));
      let menuText = DPR_translit_mod.translit((nik == 'k' || nik == 'y' || nik == 'n') ? DPR_G.G_kynames[nik][titles[i]] : DPR_G.G_nikLongName[nik] + ' ' + titles[i]);

      __searchTabViewModel.bookMenu.push({label: menuText, value: menuValue});

      // check boxes
      const label = ((nik == 'k' || nik == 'y' || nik == 'n') ? DPR_G.G_kynames[nik][titles[i]] : (typeof (titles[i]) == 'number' ? 'Book ' : '') + titles[i]);
      const cbValue = ((nik == 'k' || nik == 'y' || nik == 'n') ? (titles[i] + 1) : (i + 1));

    if (i >= Math.ceil(titles.length / 2)) {

        __searchTabViewModel.bookListB.push({label: label, id:`tsoBObook${i+1}`, value: cbValue, selected: __searchTabViewModel.searchBookCheckbox(i+1)});
      } else{
        __searchTabViewModel.bookListA.push({label: label, id:`tsoBObook${i+1}`, value: cbValue, selected: __searchTabViewModel.searchBookCheckbox(i+1)});
      }
    }
    await DPRXML.updateSearchHierarchy(0);
  },

  switchhier: function (htmp) {

    if (DPR_G.G_hier == htmp) return;

    if (htmp == 't' && this.limitt(__navigationTabViewModel.prevSetIndex)) {
      DPR_Chrome.showErrorToast('Ṭīkā not available for ' + DPR_G.G_nikLongName[__navigationTabViewModel.set()] + '.');
      __navigationTabViewModel.MAT(__navigationTabViewModel.prevMat);
      return;
    }
    if (htmp == 'a' && __navigationTabViewModel.prevSetIndex > 7) {
      DPR_Chrome.showErrorToast('Aṭṭhakathā not available for ' + DPR_G.G_nikLongName[__navigationTabViewModel.set()] + '.');
      __navigationTabViewModel.MAT(__navigationTabViewModel.prevMat);
      return;
    }
    if (__navigationTabViewModel.set() == 'k' && htmp == 'a' && DPR_G.kudvala[__navigationTabViewModel.book()] == undefined) {
      DPR_Chrome.showErrorToast('Aṭṭhakathā not available for ' + this.getBookName(__navigationTabViewModel.set(), htmp, __navigationTabViewModel.navBook().findIndex(x => x.value === __navigationTabViewModel.book())) + '.');
      __navigationTabViewModel.MAT(__navigationTabViewModel.prevMat);
      return;
    }

    DPR_G.G_hier = htmp;
    __navigationTabViewModel.prevMat = htmp;

    var book = __navigationTabViewModel.book();
    if (__navigationTabViewModel.set() == 'k') {
      if (htmp == 'm') {
        book = parseInt(book) - 1;
      }
      else {
        book = DPR_G.kudvala[book];
      }
    }
    else if (__navigationTabViewModel.set() == 'y') {
      var book = __navigationTabViewModel.book();
      if (htmp == 'm') {
        book = parseInt(book) - 1;
      }
      else {
        book = DPR_G.abhivala[book];
      }
    }
    else
      book = parseInt(book) - 1;

      this.setBookList(__navigationTabViewModel.set(), book);
    },

  historyBox: function () {
    const sectionId = DPR_Chrome.getPrimarySectionId()

    if (!DPR_PAL.isXUL) {
      return true;
    }

    // history

    var hout = '';
    var theHistory = DPR_history_mod.getHistory();
    if (theHistory.length > 0) {
      document.getElementById('hist-box').collapsed = false;
      var histNode = document.getElementById('history');
      while (histNode.itemCount > 0) histNode.removeItemAt(0);
      var isclear = '';
      histNode.appendItem('-- History --', '0');
      for (var i = 0; i < theHistory.length; i++) {
        var thist = theHistory[i].split('@');
        var thist0 = DPR_translit_mod.toUni(thist[0]);
        thist0 = thist0.split('-');
        thist0[thist0.length - 1] = DPR_translit_mod.translit(thist0[thist0.length - 1]);
        thist0 = thist0.join('-');
        histNode.appendItem(thist0, thist[1]);

        var ch = histNode.childNodes[0].childNodes;
        var x = thist[1].split(',');
        if (x.length > 3) {
          ch[i + 1].setAttribute('onclick', "DPRSend.openPlace(" + `${sectionId}, ` + "[" + x[0] + "'," + x[1] + "," + x[2] + "," + x[3] + "," + x[4] + "," + x[5] + "," + x[6] + ",'" + x[7] + "'],null,null,DPRSend.eventSend(event));");
        }
        else {
          ch[i + 1].setAttribute('onclick', "DPRSend.openIndex(" + `${sectionId}, ` + "['" + x[0] + "'," + x[1] + ",'" + x[2] + "'],DPRSend.eventSend(event));");
        }
      }
      histNode.selectedIndex = 0;
    }
    else document.getElementById('hist-box').collapsed = true;
  },

  readXML: function (file) {
    var cont = DPR_io_mod.readFile(file);
    cont = (cont ? cont.join('\n') : '<?xml version="1.0" encoding="UTF-8"?>\n<xml></xml>');
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(cont, 'text/xml');
    return xmlDoc;
  },

  searchHistoryBox: function () {
    console.log("History not yet implemented.");
    return;
    var xmlDoc = this.readXML('DPR_Search_History');

    var bNodes = xmlDoc.getElementsByTagName('search');
    if (bNodes.length > 0) {
      document.getElementById('sh-box').collapsed = false;
      var bList = document.getElementById('searches');
      while (bList.itemCount > 0) bList.removeItemAt(0);
      bList.appendItem('-- History --');

      var types = ['Sets', 'Books', 'Book', 'Part', '', 'ATI'];

      var cnt = 0;

      for (var i = bNodes.length - 1; i >= 0; i--) { // backwards
        cnt++;

        var searchType = bNodes[i].getElementsByTagName('searchType')[0].textContent;
        var searchString = bNodes[i].getElementsByTagName('query')[0].textContent;
        var searchMAT = bNodes[i].getElementsByTagName('MAT')[0].textContent;
        var searchSet = bNodes[i].getElementsByTagName('sets')[0].textContent;
        var searchBook = bNodes[i].getElementsByTagName('book')[0].textContent;
        var searchPart = bNodes[i].getElementsByTagName('part')[0].textContent;
        var searchRX = bNodes[i].getElementsByTagName('rx')[0].textContent;

        var place = '';

        switch (parseInt(searchType)) {
          case 0:
          case 5:
            place = searchSet.split('').join(',');
            break;
          case 1:
            place = DPR_G.G_nikLongName[searchSet];
            break;
          case 2:
          case 3:
          case 4:
            place = DPR_G.G_nikLongName[searchSet] + ' ' + searchBook.split('').join(',');
            break;
        }

        bList.appendItem('\'' + searchString + '\' - ' + place + ' (' + types[parseInt(searchType)] + ')');

        var ch = bList.childNodes[0].childNodes;
        ch[cnt].setAttribute('value', searchType + "|" + searchString + "|" + searchMAT + "|" + searchSet + "|" + searchBook + "|" + searchPart + "|" + searchRX);
        //ch[cnt].setAttribute('tooltiptext','run search');
      }
      bList.selectedIndex = 0;

    }
    else document.getElementById('sh-box').collapsed = true;
  },

  dictHistoryBox: function () {
    var xmlDoc = this.readXML('DPR_Dict_History');

    var bNodes = xmlDoc.getElementsByTagName('dict');
    if (bNodes.length > 0) {
      document.getElementById('dh-box').collapsed = false;
      var bList = document.getElementById('dicts');
      while (bList.itemCount > 0) bList.removeItemAt(0);
      bList.appendItem('-- History --');

      var cnt = 0;

      for (var i = bNodes.length - 1; i >= 0; i--) {
        cnt++;

        var query = bNodes[i].getElementsByTagName('query')[0].textContent;
        var type = bNodes[i].getElementsByTagName('type')[0].textContent;
        var opts = bNodes[i].getElementsByTagName('opts')[0].textContent.replace(/,/g, "','");

        bList.appendItem(query + ' (' + type + ')');

        var ch = bList.childNodes[0].childNodes;
        ch[cnt].setAttribute('onclick', "DPRSend.sendDict(true,DPRSend.eventSend(event),'" + type + "','" + DPR_translit_mod.translit(query) + "',['" + opts + "']);");
        ch[cnt].setAttribute('tooltiptext', 'run lookup');
      }
      bList.selectedIndex = 0;

    }
    else document.getElementById('dh-box').collapsed = true;
  },


  bookmarkBox: function () {
    var xmlDoc = this.readXML('DPR_Bookmarks');

    var bNodes = xmlDoc.getElementsByTagName('bookmark');
    if (bNodes.length > 0) {
      document.getElementById('bm-box').collapsed = false;
      var bList = document.getElementById('bookmarks');
      while (bList.itemCount > 0) bList.removeItemAt(0);
      bList.appendItem('-- Bookmarks --');
      for (var i = 0; i < bNodes.length; i++) {

        var name = bNodes[i].getElementsByTagName('name')[0].textContent;
        var loc = bNodes[i].getElementsByTagName('location')[0].textContent.split('#');
        var scroll = bNodes[i].getElementsByTagName('scroll')[0].textContent;
        var desc = bNodes[i].getElementsByTagName('description')[0].textContent;

        bList.appendItem(DPR_translit_mod.translit(name));

        var ch = bList.childNodes[0].childNodes;
        ch[i + 1].setAttribute('onclick', "DPRSend.openPlace(" + `${sectionId}` + "[" + loc[0] + "'," + loc[1] + "," + loc[2] + "," + loc[3] + "," + loc[4] + "," + loc[5] + "," + loc[6] + ",'" + loc[7] + "'],null,null,DPRSend.eventSend(event)," + scroll + ");");
        ch[i + 1].setAttribute('tooltiptext', desc);
      }
      bList.selectedIndex = 0;

    }
    else document.getElementById('bm-box').collapsed = true;
  },

  gotoPlace: function (place) {
    __navigationTabViewModel.set(place[0]);
    const b = __navigationTabViewModel.navBook().findIndex(x => x.value === parseInt(place[1]) + 1);
    __navigationTabViewModel.book(__navigationTabViewModel.navBook()[b].value);
    __navigationTabViewModel.MAT(place[place.length-1]);
    if (place.length > 3) {
      __navigationTabViewModel.meta(place[2].toString().replace('x','0'));
      __navigationTabViewModel.volume(place[3].toString().replace('x','0'));
      __navigationTabViewModel.vagga(place[4].toString().replace('x','0'));
      __navigationTabViewModel.sutta(place[5].toString().replace('x','0'));
      __navigationTabViewModel.section(place[6].toString().replace('x','0'));
    }
  },

  searchBook: async function (nik, book, hiert) {
    appInsights.trackEvent({ name: 'Search book',  properties: { nik, book, hiert }});

    DPR_Chrome.openDPRSidebar();
    $("#searchTab").click();
    document.getElementById('tipType').selectedIndex = 2;
    await DPROpts.tipitakaOptions();
    document.getElementById('tsoSETm').selectedIndex = DPR_G.G_nikToNumber[nik];
    await this.setSearchBookList();

    document.getElementById('tsoBOOKm').selectedIndex = book - 1;
    await DPRXML.updateSearchHierarchy(0);
    document.getElementById('tsoMATm').checked= (hiert == 'm');
    document.getElementById('tsoMATa').checked= (hiert == 'a');
    document.getElementById('tsoMATt').checked= (hiert == 't');
  },

}
