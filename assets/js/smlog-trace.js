/*
 * 스마트로그 전환 보내기 (주문·문의)
 * 이 사이트는 예약을 마쳐도 새 페이지로 넘어가지 않습니다. 그래서 전환 값(hpt_trace_info)을 넣고
 * 주소의 쿼리(?sl=...)만 바꿉니다. smart.js는 주소의 경로·쿼리가 바뀌면 그 순간의 전환 값을 함께 보냅니다.
 * 이름·연락처 같은 개인정보는 보내지 않습니다(_memid는 비워 둠).
 */
(function () {
  function send(mode, price, tries) {
    // smart.js가 첫 방문 기록을 끝내야 주소 변경 감지가 켜집니다. 그 전이면 잠시 기다립니다.
    if (!window._smtg_spaBound) {
      if (tries < 20) setTimeout(function () { send(mode, price, tries + 1); }, 500);
      return;
    }
    try {
      var info = { _mode: mode, _memid: '' };
      if (price !== undefined && price !== null && price !== '') info._total_price = String(price);
      window.hpt_trace_info = info;
      var u = new URL(location.href);
      u.searchParams.set('sl', mode + '-' + Date.now().toString(36));
      history.replaceState(history.state, '', u.pathname + u.search + u.hash);
    } catch (e) {
      // 전환 기록 실패는 예약·문의 흐름에 영향을 주지 않습니다.
    } finally {
      window.hpt_trace_info = undefined; // 다음 기록에 전환 값이 다시 붙지 않게 비웁니다.
    }
  }

  window.nolSmlogTrace = function (mode, price) { send(mode, price, 0); };

  // 문의 전환: 카카오톡 상담·전화 버튼을 누를 때
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="tel:"], a[href*="pf.kakao.com"]') : null;
    if (a) window.nolSmlogTrace('q');
  }, true);
})();
