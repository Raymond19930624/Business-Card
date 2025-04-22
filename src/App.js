import React, { useState, useRef, useEffect } from "react";
import employees from "./data/employees.json";
import CardPreview from "./components/CardPreview";
import logo from "../public/logo.png";
import ReactDOM from 'react-dom';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

const forcedFields = ["員工姓名(中)", "員工姓名(英)", "職位(中)", "職位(英)", "信箱", "統一編號"];
const selectableFieldsOrder = [
  "手機",
  "苗栗電話",
  "台北電話",
  "苗栗地址",
  "台北地址",
  "部門"
];
const defaultFields = {
  "部門": true,
  "苗栗電話": true,
  "台北電話": true,
  "苗栗地址": true,
  "台北地址": true,
  "手機": false
};

// 新增：手機號碼格式化函式
function formatMobile(input) {
  // 只取數字
  const digits = input.replace(/\D/g, "");
  // 只保留前10碼
  const clean = digits.slice(0, 10);
  if (clean.length !== 10) return input; // 不足10碼直接回傳原輸入
  return `${clean.slice(0,4)}-${clean.slice(4,7)}-${clean.slice(7,10)}`;
}

export default function App() {
  const [empId, setEmpId] = useState("");
  const [selected, setSelected] = useState(null);
  const [fields, setFields] = useState(defaultFields);
  const [errorMsg, setErrorMsg] = useState("");
  const [employeesFromExcel, setEmployeesFromExcel] = useState([]);
  const inputRef = useRef(null);
  const [miaoliExtVisible, setMiaoliExtVisible] = useState(true);
  const [excelMode, setExcelMode] = useState(false);
  const fileInputRef = useRef(null);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputHasValue, setInputHasValue] = useState(false);
  const autoCompleteRef = useRef(null);
  const [inputDisplayValue, setInputDisplayValue] = useState("");
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const suggestionRefs = useRef([]);
  const [mobileInput, setMobileInput] = useState(""); // 新增：手機輸入框狀態
  const [lineId, setLineId] = useState(""); // 新增：Line ID 狀態

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (autoCompleteRef.current && !autoCompleteRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeSuggestion >= 0 && suggestionRefs.current[activeSuggestion]) {
      suggestionRefs.current[activeSuggestion].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeSuggestion, searchSuggestions]);

  const handleSearch = () => {
    const normalizeId = id => String(id).replace(/^e/i, '').toLowerCase();
    const searchId = normalizeId(empId.trim());
    if (!searchId) {
      setErrorMsg("請輸入員工編號");
      setSelected(null);
      return;
    }
    const found = employees.find(e => normalizeId(e["員工編號"]) === searchId);
    if (!found) {
      setErrorMsg("員工編號錯誤或尚未建檔，請確認員工編號或聯繫資安課");
      setSelected(null);
      return;
    }
    setSelected(found);
    setInputDisplayValue(`${found["員工編號"]} ${found["員工姓名(中)"]} ${found["員工姓名(英)"]}`);
    setShowSuggestions(false);
    setErrorMsg("");
  };

  const handleFieldChange = (field) => {
    setFields({ ...fields, [field]: !fields[field] });
  };

  const handleInputKeyDown = (e) => {
    if (!showSuggestions && e.key === 'ArrowDown') {
      setShowSuggestions(true);
      setActiveSuggestion(0);
      setSearchSuggestions(
        (inputDisplayValue.trim() ? searchSuggestions : employees.slice(0, 20))
      );
      return;
    }
    if (showSuggestions && searchSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestion((prev) => Math.min(prev + 1, searchSuggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestion((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        if (activeSuggestion >= 0 && activeSuggestion < searchSuggestions.length) {
          handleEmpSelect(searchSuggestions[activeSuggestion]);
        } else {
          handleSearch();
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    }
  };

  useEffect(() => {
    setActiveSuggestion(-1);
  }, [showSuggestions, searchSuggestions]);

  const handleSaveImage = () => {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    document.body.appendChild(container);
    const root = ReactDOM.createRoot(container);
    root.render(
      <CardPreview employee={{...selected, 手機: formatMobile(mobileInput)}} fields={fields} downloadMode={true} miaoliExtVisible={miaoliExtVisible} lineId={lineId} />
    );
    setTimeout(() => {
      html2canvas(container.querySelector('div')).then(canvas => {
        const link = document.createElement('a');
        link.download = `${selected["員工姓名(中)"] || 'card'}.png`;
        link.href = canvas.toDataURL();
        link.click();
        root.unmount();
        document.body.removeChild(container);
      });
    }, 200); // 等待渲染完成
  };

  const handleEmpIdChange = (e) => {
    const value = e.target.value;
    setInputDisplayValue(value);
    setInputHasValue(!!value.trim());
    setErrorMsg(""); // 每次輸入都清空錯誤訊息
    // 嘗試從完整格式中抓出員工編號
    const match = value.match(/^(E\d{4,})/i);
    setEmpId(match ? match[1].toUpperCase() : value);
    if (!value.trim()) {
      setShowSuggestions(false);
      setSearchSuggestions([]);
      setErrorMsg(""); // 清空輸入時也清空錯誤訊息
      return;
    }
    setShowSuggestions(true);
    const keyword = value.trim().toLowerCase();
    const list = employees.filter(emp =>
      (emp["員工編號"] && emp["員工編號"].toLowerCase().includes(keyword)) ||
      (emp["員工姓名(中)"] && emp["員工姓名(中)"].toLowerCase().includes(keyword)) ||
      (emp["員工姓名(英)"] && emp["員工姓名(英)"].toLowerCase().includes(keyword))
    ).slice(0, 20);
    setSearchSuggestions(list);
    // 新增：即時顯示查無此員工提示
    if (list.length === 0 && value.trim()) {
      setErrorMsg("查無此員工，請確認編號或姓名");
    } else {
      setErrorMsg("");
    }
  };

  const handleEmpIdFocus = () => {
    setInputDisplayValue(""); // 點選輸入框時自動清空內容
    setEmpId(""); // 同步清空 empId
    setErrorMsg(""); // 同步清空錯誤訊息
  };

  const handleDropdownClick = () => {
    setShowSuggestions(s => !s);
    setSearchSuggestions(employees);
    inputRef.current && inputRef.current.focus();
  };

  const handleEmpSelect = (emp) => {
    setEmpId(emp["員工編號"]);
    setInputDisplayValue(`${emp["員工編號"]} ${emp["員工姓名(中)"]} ${emp["員工姓名(英)"]}`);
    setSelected(emp);
    setMobileInput(""); // 清空手機
    setLineId("");    // 清空LINE ID
    setShowSuggestions(false);
    setErrorMsg("");
  };

  const handleMobileInputChange = (e) => {
    const value = e.target.value;
    setMobileInput(value);
    // 若有輸入手機號碼且尚未勾選，則自動勾選
    if (value.trim() && !fields['手機']) {
      setFields(prev => ({ ...prev, '手機': true }));
    }
  };

  const handleLineIdChange = (e) => {
    const value = e.target.value;
    setLineId(value);
    // 若有輸入Line ID且尚未勾選，則自動勾選
    if (value.trim() && !fields['Line ID']) {
      setFields(prev => ({ ...prev, 'Line ID': true }));
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: "linear-gradient(135deg, #e3ecfa 0%, #f6fafd 100%)",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 40, 
      boxSizing: 'border-box',
    }}>
      {/* 上方白色卡片：只包標題、輸入、欄位選擇 */}
      <div style={{
        width: '100%',
        maxWidth: 310,
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 1px 3px #b6c2d911',
        padding: '6px 2px 4px 2px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        backdropFilter: 'blur(1px)',
        marginBottom: 6,
      }}>
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4, marginTop: 18 }}>
          <img src={logo} alt="logo" style={{ width: 24, height: 24, marginRight: 6, borderRadius: 6, background: '#fff', boxShadow: '0 1px 2px rgba(30,42,73,0.06)' }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: '#22335c', letterSpacing: 1 }}>昇陽名片預覽器</span>
        </div>
        <div style={{ width: '100%', marginBottom: 4 }}>
          <div ref={autoCompleteRef} style={{ margin: '0 auto', width: 280, position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <input
                ref={inputRef}
                type="text"
                placeholder="請輸入員工編號或姓名"
                value={inputDisplayValue}
                onChange={handleEmpIdChange}
                onFocus={handleEmpIdFocus}
                onKeyDown={handleInputKeyDown}
                style={{
                  width: '100%',
                  height: 28,
                  fontSize: 13,
                  padding: '0 30px 0 8px',
                  borderRadius: 5,
                  border: '1px solid #b5d3f7',
                  marginBottom: 0,
                  boxSizing: 'border-box',
                }}
                autoComplete="off"
              />
              <button
                tabIndex={-1}
                type="button"
                aria-label="展開員工清單"
                onClick={handleDropdownClick}
                style={{
                  position: 'absolute',
                  right: 2,
                  top: 2,
                  width: 28,
                  height: 28,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18"><path d="M6 9l5 5 5-5" stroke="#6ea0f8" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
              </button>
            </div>
            {/* 錯誤訊息顯示區塊 */}
            <div style={{ color: '#e53935', marginTop: 4, fontSize: 12, fontWeight: 500, minHeight: 16 }}>
              {errorMsg}
            </div>
            {showSuggestions && (inputHasValue || searchSuggestions.length > 0) && (
              <div style={{
                position: 'absolute',
                top: 32,
                left: 0,
                width: '100%',
                background: '#fff',
                border: '1px solid #e3e8f0',
                borderRadius: 5,
                boxShadow: '0 1px 6px #204a7422',
                zIndex: 10,
                maxHeight: 200,
                overflowY: 'auto',
              }}>
                {searchSuggestions.map((emp, idx) => (
                  <div
                    key={emp["員工編號"]}
                    ref={el => suggestionRefs.current[idx] = el}
                    onClick={() => handleEmpSelect(emp)}
                    onMouseEnter={() => setActiveSuggestion(idx)}
                    onMouseLeave={() => setActiveSuggestion(-1)}
                    style={{
                      padding: '4px 8px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f0f0f0',
                      background: idx === activeSuggestion ? '#dbeafe' : (empId === emp["員工編號"] ? '#eaf6ff' : undefined),
                      color: idx === activeSuggestion ? '#1e40af' : undefined,
                      fontWeight: idx === activeSuggestion ? 600 : 400,
                    }}
                  >
                    <span style={{ color: '#1e2a49', fontWeight: 500 }}>{emp["員工編號"]}</span>
                    <span style={{ marginLeft: 8 }}>{emp["員工姓名(中)"]}</span>
                    <span style={{ marginLeft: 8, color: '#888' }}>{emp["員工姓名(英)"]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {selected && (
          <div style={{ width: '100%' }}>
            {/* 分組區塊 */}
            <div style={{ padding: '1px 0 0 0', fontWeight: 600, color: '#4b5b7a', fontSize: 10, display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1 }}>
              <span role="img" aria-label="phone" style={{ fontSize: 11, verticalAlign: 'middle', display: 'inline-flex', alignItems: 'center' }}>📞</span>
              <span style={{ lineHeight: 1, display: 'inline-block', verticalAlign: 'middle' }}>聯絡資訊</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, borderBottom: '1px solid #e3ecfa', paddingBottom: 1, marginBottom: 1, alignItems: 'flex-start' }}>
              {/* 手機欄位獨立一行 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 13, color: '#1e2a49', fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={!!mobileInput}
                    readOnly
                    tabIndex={-1}
                    className="custom-checkbox"
                    style={{ marginRight: 2, cursor: 'pointer', opacity: 1, pointerEvents: 'none' }}
                  />手機
                </label>
                <input
                  type="text"
                  placeholder="請輸入手機號碼"
                  value={mobileInput}
                  onChange={handleMobileInputChange}
                  style={{
                    fontSize: 13,
                    padding: '1px 6px',
                    borderRadius: 5,
                    border: '1.5px solid #e3ecfa',
                    width: 110
                  }}
                  maxLength={13}
                />
              </div>
              {/* Line ID欄位獨立一行 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 13, color: '#1e2a49', fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={!!lineId}
                    readOnly
                    tabIndex={-1}
                    className="custom-checkbox"
                    style={{ marginRight: 2, cursor: 'pointer', opacity: 1, pointerEvents: 'none' }}
                  />Line ID
                </label>
                <input
                  type="text"
                  placeholder="請輸入Line ID"
                  value={lineId}
                  onChange={handleLineIdChange}
                  style={{
                    fontSize: 13,
                    padding: '1px 6px',
                    borderRadius: 5,
                    border: '1.5px solid #e3ecfa',
                    width: 110
                  }}
                  maxLength={30}
                />
              </div>
              {/* 其餘電話欄位橫向排列 */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                {/* 苗栗電話及分機合併一組 */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 13, color: '#1e2a49', fontWeight: 500 }}>
                  <input type="checkbox" checked={fields['苗栗電話']} onChange={() => handleFieldChange('苗栗電話')} style={{ marginRight: 2 }} />苗栗電話
                  <span style={{ marginLeft: 4 }}>分機</span>
                  <select
                    value={miaoliExtVisible ? 'show' : 'hide'}
                    onChange={e => setMiaoliExtVisible(e.target.value === 'show')}
                    style={{
                      borderRadius: 5,
                      border: '1.5px solid #e3ecfa',
                      padding: '2px 8px',
                      fontSize: 13,
                      background: '#fff',
                      boxShadow: '0 1px 2px #b6c2d922',
                      outline: 'none',
                      cursor: 'pointer',
                      minWidth: 48,
                      marginLeft: 2
                    }}
                  >
                    <option value="show">顯示</option>
                    <option value="hide">隱藏</option>
                  </select>
                </label>
                {/* 台北電話維持原本 */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 13, color: '#1e2a49', fontWeight: 500 }}>
                  <input type="checkbox" checked={fields['台北電話']} onChange={() => handleFieldChange('台北電話')} style={{ marginRight: 2 }} />台北電話
                </label>
              </div>
            </div>
            <div style={{ padding: '2px 0 0 0', fontWeight: 600, color: '#4b5b7a', fontSize: 10, display: 'flex', alignItems: 'center', gap: 1 }}>
              <span role="img" aria-label="home" style={{ fontSize: 11, verticalAlign: 'middle', display: 'inline-flex', alignItems: 'center' }}>🏠</span>
              <span style={{ lineHeight: 1, display: 'inline-block', verticalAlign: 'middle' }}>地址資訊</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, borderBottom: '1px solid #e3ecfa', paddingBottom: 1, marginBottom: 1 }}>
              {['苗栗地址', '台北地址'].map(f => (
                <label key={f} style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 13, color: '#1e2a49', fontWeight: 500 }}>
                  <input type="checkbox" checked={fields[f]} onChange={() => handleFieldChange(f)} style={{ marginRight: 2 }} />{f}
                </label>
              ))}
            </div>
            <div style={{ padding: '2px 0 0 0', fontWeight: 600, color: '#4b5b7a', fontSize: 10, display: 'flex', alignItems: 'center', gap: 1 }}>
              <span role="img" aria-label="setting" style={{ fontSize: 11, verticalAlign: 'middle', display: 'inline-flex', alignItems: 'center' }}>⚙️</span>
              <span style={{ lineHeight: 1, display: 'inline-block', verticalAlign: 'middle' }}>其他選項</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['部門'].map(f => (
                <label key={f} style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 13, color: '#1e2a49', fontWeight: 500 }}>
                  <input type="checkbox" checked={fields[f]} onChange={() => handleFieldChange(f)} style={{ marginRight: 2 }} />{f}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* 名片預覽區塊分開，置中顯示 */}
      {selected && (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', margin: '0 auto', position: 'relative' }}>
          <div style={{ width: 340, maxWidth: '100vw', position: 'relative', top: 0 }}>
            <CardPreview
              employee={{...selected, 手機: formatMobile(mobileInput)}}
              fields={fields}
              logo={logo}
              handleSaveImage={handleSaveImage}
              miaoliExtVisible={miaoliExtVisible}
              lineId={lineId}
            />
          </div>
        </div>
      )}
    </div>
  );
}
