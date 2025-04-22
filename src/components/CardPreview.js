import React, { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";

// ICON 路徑對應（使用相對路徑，確保本地與 GitHub Pages 都能顯示）
const iconPaths = {
  mobile: 'mobile.svg',
  phone: 'phone.svg',
  map: 'map.svg',
  email: 'email.svg',
  vat: 'vat.svg',
  line: 'line.svg',
};

const CARD_WIDTH_PX = 340;
const CARD_HEIGHT_PX = 204;

const cardFont = `'Noto Sans TC', 'Inter', 'Roboto', 'Microsoft JhengHei', Arial, sans-serif`;

const cardBg = {
  background: `url('background.svg') center/cover no-repeat`,
  boxShadow: '0 4px 24px #204a7422',
  padding: 0,
  overflow: 'hidden',
  position: 'relative',
  width: CARD_WIDTH_PX,
  height: CARD_HEIGHT_PX,
  maxWidth: '100vw',
  margin: '32px auto',
  minHeight: CARD_HEIGHT_PX,
  display: 'block',
  fontFamily: cardFont
};

const TAIPEI_TEL = "02-7709-2525";
const MIAOLI_TEL = "037-230388";
const TAIPEI_ADDR = "台北市松山區南京東路四段161號6樓";
const MIAOLI_ADDR = "苗栗縣銅鑼鄉中興路26-1號";

const styles = {
  // 員工姓名(中)
  員工姓名中: {
    position: 'absolute',
    left: 275,
    top: 43,
    fontSize: 16,
    fontFamily: `'Noto Sans TC', 'Microsoft JhengHei', Arial, sans-serif`,
    color: '#232323',
    transform: 'translateX(-50%)',
  },
  // 員工姓名(英)
  員工姓名英: {
    position: 'absolute',
    left: 275,
    top: 63,
    fontSize: 9,
    fontFamily: `'Inter', 'Roboto', Arial, sans-serif`,
    color: '#232323',
    transform: 'translateX(-50%)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 230, 
  },
  // 部門(中)
  部門中: {
    display: 'none', 
  },
  // 部門(英)
  部門英: {
    display: 'none', 
  },
  // 職位(中)
  職位中: {
    position: 'absolute',
    left: 155, 
    top: 80,
    width: 165, 
    fontSize: 8,
    fontFamily: `'Noto Sans TC', 'Microsoft JhengHei', Arial, sans-serif`,
    color: '#232323',
    textAlign: 'right',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // 職位(英)
  職位英: {
    position: 'absolute',
    left: 155,
    top: 90, // 原本100，往上移10px
    width: 165,
    fontSize: 8,
    fontFamily: `'Inter', 'Roboto', Arial, sans-serif`,
    color: '#232323',
    textAlign: 'right',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'block',
  },
  // 手機
  手機: {
    position: 'absolute',
    left: 36.91,
    top: 105.97, 
    fontSize: 8,
    fontFamily: `'Inter', 'Roboto', Arial, sans-serif`,
    color: '#232323'
  },
  // 電話苗栗
  電話苗栗: {
    position: 'absolute',
    left: 36.91,
    top: 115.97, 
    fontSize: 8,
    fontFamily: `'Inter', 'Roboto', Arial, sans-serif`,
    color: '#232323'
  },
  // 分機(苗栗)
  分機苗栗: {
    position: 'absolute',
    left: 36.91,
    top: 111.97, 
    fontSize: 8,
    fontFamily: `'Inter', 'Roboto', Arial, sans-serif`,
    color: '#232323'
  },
  // 電話台北
  電話台北: {
    position: 'absolute',
    left: 36.91,
    top: 125.97, 
    fontSize: 8,
    fontFamily: `'Inter', 'Roboto', Arial, sans-serif`,
    color: '#232323'
  },
  // 分機(台北)
  分機台北: {
    position: 'absolute',
    left: 36.91,
    top: 117.97, 
    fontSize: 8,
    fontFamily: `'Inter', 'Roboto', Arial, sans-serif`,
    color: '#232323'
  },
  // 信箱
  信箱: {
    position: 'absolute',
    left: 37.07,
    top: 135.97, 
    fontSize: 8,
    fontFamily: `'Inter', 'Roboto', Arial, sans-serif`,
    color: '#232323'
  },
  // 統一編號
  統一編號: {
    position: 'absolute',
    left: 37.07,
    top: 145.97, 
    fontSize: 8,
    fontFamily: `'Inter', 'Roboto', Arial, sans-serif`,
    color: '#232323'
  },
  // 地址(苗栗)
  地址苗栗: {
    position: 'absolute',
    left: 37.07,
    top: 155.97, 
    fontSize: 8,
    fontFamily: `'Noto Sans TC', 'Microsoft JhengHei', Arial, sans-serif`,
    color: '#232323'
  },
  // 地址(台北)
  地址台北: {
    position: 'absolute',
    left: 36.91,
    top: 165.97, 
    fontSize: 8,
    fontFamily: `'Noto Sans TC', 'Microsoft JhengHei', Arial, sans-serif`,
    color: '#232323'
  },
  // 分機
  分機: {
    position: 'absolute',
    left: 120,
    top: 85.97,
    fontSize: 8,
    fontFamily: 'Microsoft YaHei',
    color: '#232323'
  },
  電話苗栗: {
    position: 'absolute',
    left: 36.91,
    top: 108.97, 
    fontSize: 8,
    fontFamily: 'Microsoft YaHei',
    color: '#232323'
  },
  電話台北: {
    position: 'absolute',
    left: 36.91,
    top: 114.97, 
    fontSize: 8,
    fontFamily: 'Microsoft YaHei',
    color: '#232323'
  },
};

const responsiveStyle = `
@media (max-width: 400px) {
  .card-main-row { flex-direction: column !important; padding: 8px 2vw 8px 2vw !important; }
  .card-left { align-items: flex-start !important; }
  .card-right { align-items: flex-start !important; padding-left: 0 !important; margin-top: 6px; }
  .card-name-zh { font-size: 13px !important; }
  .card-name-en { font-size: 9px !important; }
}
`;

function getScale() {
  const vw = window.innerWidth;
  const maxW = 600;
  if (vw >= maxW) return maxW / CARD_WIDTH_PX;
  if (vw < CARD_WIDTH_PX + 32) return (vw - 32) / CARD_WIDTH_PX;
  return 1;
}

export default function CardPreview({ employee, fields, downloadMode, miaoliExtVisible, lineId }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardScale, setCardScale] = useState(1);

  useEffect(() => {
    function handleResize() {
      const wScale = Math.min(window.innerWidth * 0.98, 800) / CARD_WIDTH_PX;
      const hScale = (window.innerHeight * 0.9) / CARD_HEIGHT_PX;
      setCardScale(Math.min(wScale, hScale, 1));
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!employee) return null;

  const startX = useRef(null);
  const dragging = useRef(false);

  function onTouchStart(e) {
    if (e.touches && e.touches.length === 1) {
      startX.current = e.touches[0].clientX;
      dragging.current = true;
    }
  }
  function onTouchMove(e) {
    // 預留未來滑動動畫
  }
  function onTouchEnd(e) {
    if (!dragging.current) return;
    const endX = e.changedTouches[0].clientX;
    const delta = endX - startX.current;
    if (Math.abs(delta) > 50) {
      setIsFlipped(f => !f);
    }
    dragging.current = false;
  }

  function onMouseDown(e) {
    startX.current = e.clientX;
    dragging.current = true;
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }
  function onMouseMove(e) {
    // 預留未來滑動動畫
  }
  function onMouseUp(e) {
    if (!dragging.current) return;
    const endX = e.clientX;
    const delta = endX - startX.current;
    if (Math.abs(delta) > 50) {
      setIsFlipped(f => !f);
    }
    dragging.current = false;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  }

  return (
    <div style={{
      perspective: 1200,
      width: CARD_WIDTH_PX * cardScale,
      height: CARD_HEIGHT_PX * cardScale,
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'width 0.2s, height 0.2s',
    }}>
      <div
        className="card-flip-inner"
        style={{
          width: CARD_WIDTH_PX,
          height: CARD_HEIGHT_PX,
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s cubic-bezier(.4,2,.6,1)',
          transform: `${isFlipped ? 'rotateY(180deg)' : ''} scale(${cardScale})`,
          cursor: 'pointer',
        }}
        onClick={() => setIsFlipped(f => !f)}
        title={isFlipped ? '點擊翻回正面' : '點擊查看背面'}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
      >
        {/* 正面 */}
        <div
          className="card-front"
          style={{
            ...cardBg,
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 0,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 16,
            overflow: 'hidden',
            zIndex: 2,
          }}
        >
          {/* 姓名、職位強制顯示，中英文連動 */}
          <div style={styles["員工姓名中"]}>{employee["員工姓名(中)"]}</div>
          <div style={styles["員工姓名英"]}>{employee["員工姓名(英)"]}</div>
          {/* 中文職稱與部門合併顯示，靠右對齊 */}
          {(fields["部門"] && employee["部門(中)"] && employee["職位(中)"]) ? (
            <div style={styles["職位中"]}>{employee["部門(中)"] + ' ' + employee["職位(中)"]}</div>
          ) : (employee["職位(中)"] && (
            <div style={styles["職位中"]}>{employee["職位(中)"]}</div>
          ))}
          {/* 英文職稱與部門合併顯示，超過100px則分行 */}
          {(fields["部門"] && employee["部門(英)"] && employee["職位(英)"]) ? (
            (() => {
              // 建立一個隱藏的span來量測長度
              const text = employee["部門(英)"] + ' ' + employee["職位(英)"];
              const span = document.createElement('span');
              span.style.fontFamily = 'Microsoft YaHei';
              span.style.fontSize = '8px';
              span.style.position = 'absolute';
              span.style.visibility = 'hidden';
              span.innerText = text;
              document.body.appendChild(span);
              const width = span.offsetWidth;
              document.body.removeChild(span);
              if (width > 100) {
                // 分兩行顯示
                return (
                  <>
                    <div style={styles["職位英"]}>{employee["部門(英)"]}</div>
                    <div style={{...styles["職位英"], top: styles["職位英"].top + 10}}>{employee["職位(英)"]}</div>
                  </>
                );
              } else {
                // 一行顯示
                return (
                  <div style={styles["職位英"]}>{text}</div>
                );
              }
            })()
          ) : (employee["職位(英)"] && (
            <div style={styles["職位英"]}>{employee["職位(英)"]}</div>
          ))}
          {(() => {
            const infoFields = [
              fields["手機"] && employee["手機"] ? { label: '手機', value: formatPhoneNumber(employee["手機"]), icon: iconPaths.mobile } : null,
              fields["苗栗電話"] ? { label: '苗栗電話', value: `${MIAOLI_TEL}${miaoliExtVisible && employee["分機(苗栗)"] ? ` ext.${employee["分機(苗栗)"]}` : ''}`, icon: iconPaths.phone } : null,
              fields["台北電話"] ? { label: '台北電話', value: TAIPEI_TEL, icon: iconPaths.phone } : null,
              employee["信箱"] ? { label: '信箱', value: employee["信箱"], icon: iconPaths.email } : null,
              { label: '統編', value: '56153007', icon: iconPaths.vat },
              fields["苗栗地址"] ? { label: '苗栗地址', value: MIAOLI_ADDR, icon: iconPaths.map } : null,
              fields["台北地址"] ? { label: '台北地址', value: TAIPEI_ADDR, icon: iconPaths.map } : null,
              lineId ? { label: 'Line ID', value: lineId, icon: iconPaths.line } : null,
            ].filter(Boolean);
            const startTop = 107.97;
            const gap = 12.5;
            return infoFields.map((item, idx) => {
              // 不顯示標籤：電話、地址、信箱，但要顯示「苗栗：」「台北：」
              let showValue = item.value;
              if (item.label === '手機') showValue = '手機：' + item.value;
              if (item.label === '信箱') showValue = '信箱：' + item.value;
              if (item.label === '統編') showValue = '統編：' + item.value;
              if (item.label === '苗栗電話' || item.label === '苗栗地址') showValue = '苗栗：' + item.value;
              if (item.label === '台北電話' || item.label === '台北地址') showValue = '台北：' + item.value;
              if (item.label === 'Line ID') showValue = 'Line ID：' + item.value;
              return (
                <div key={item.label + idx} style={{ position: 'absolute', left: 46.5, top: startTop + idx * gap - 3, fontSize: 8, fontFamily: item.label === '統一編號' || item.label === '手機' || item.label === '信箱' || item.label === '電話苗栗' || item.label === '電話台北' || item.label === '分機(苗栗)' || item.label === '分機(台北)' || item.label === 'Line ID' ? `'Inter', 'Roboto', Arial, sans-serif` : `'Noto Sans TC', 'Microsoft JhengHei', Arial, sans-serif`, color: '#232323', display: 'flex', alignItems: 'center' }}>
                  <img src={item.icon} alt={item.label} style={{ position: 'absolute', left: -16, width: '10px', height: '10px', verticalAlign: 'middle' }} />
                  {showValue}
                </div>
              );
            });
          })()}
        </div>
        {/* 背面 */}
        <div
          className="card-back"
          style={{
            ...cardBg,
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            borderTopLeftRadius: 0,
            borderTopRightRadius: 16,
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 0,
            overflow: 'hidden',
            transform: 'rotateY(180deg)',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
        >
          {/* 背面：顯示 card-back.svg 圖片 */}
          <img 
            src="card-back.svg"
            alt="名片背面"
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderTopLeftRadius: 0, borderTopRightRadius: 16, borderBottomLeftRadius: 16, borderBottomRightRadius: 0 }} 
          />
        </div>
      </div>
    </div>
  );
}

function formatPhoneNumber(phoneNumber) {
  const cleanedPhoneNumber = phoneNumber.replace(/[^0-9]/g, '');
  if (cleanedPhoneNumber.length === 10) {
    return `${cleanedPhoneNumber.slice(0, 4)}-${cleanedPhoneNumber.slice(4, 7)}-${cleanedPhoneNumber.slice(7, 10)}`;
  } else {
    return cleanedPhoneNumber;
  }
}
