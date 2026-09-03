import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import styles from "../styles/DataView.module.scss";

const EMPTY = { name: "", address: "", city: "", phone: "", latitude: "", longitude: "", isActive: true };

export default function PickupPointsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState("");
  const [open, setOpen] = useState(false), [form, setForm] = useState(EMPTY), [editing, setEditing] = useState(null);

  async function load() {
    setLoading(true); setError("");
    try { const res = await api.get("/pickup-points?limit=100", token); setItems(res.items || res.data || res || []); }
    catch (e) { setError(e.message); setItems([]); } finally { setLoading(false); }
  }
  useEffect(() => { if (token) load(); }, [token]);
  function edit(p) { setEditing(p); setForm({ ...EMPTY, ...p }); setOpen(true); }
  function openYandexMap(p) {
    const hasCoords = p.latitude !== undefined && p.latitude !== null && p.longitude !== undefined && p.longitude !== null && p.latitude !== "" && p.longitude !== "";
    const query = hasCoords ? `${p.latitude},${p.longitude}` : [p.city, p.address].filter(Boolean).join(", ");
    if (!query) return;
    window.open(`https://yandex.uz/maps/?text=${encodeURIComponent(query)}`, "_blank", "noopener,noreferrer");
  }
  async function save(e) {
    e.preventDefault(); setError("");
    const payload = { ...form, latitude: form.latitude === "" ? undefined : Number(form.latitude), longitude: form.longitude === "" ? undefined : Number(form.longitude) };
    try { if (editing) await api.patch(`/pickup-points/${editing.id}`, payload, token); else await api.post("/pickup-points", payload, token); setOpen(false); load(); }
    catch (e) { setError(e.message); }
  }
  async function remove(p) { if (!confirm(`Удалить точку «${p.name || p.address}»?`)) return; try { await api.del(`/pickup-points/${p.id}`, token); load(); } catch(e) { alert(e.message); } }
  return <Layout title="Точки выдачи">
    <div className={styles.toolbar}><div><div className={styles.pageHint}>Пункты выдачи, адреса и привязка автомобилей</div></div><button className="btn btn-primary" onClick={() => {setEditing(null);setForm(EMPTY);setOpen(true)}}>+ Добавить точку</button></div>
    {error && <div className={styles.errorPanel}>{error}</div>}
    <div className={styles.card}>{loading ? <div className={styles.loading}>Загрузка...</div> : items.length === 0 ? <div className={styles.emptyState}>Точки выдачи не найдены</div> : <table className={styles.table}><thead><tr><th>Название</th><th>Адрес</th><th>Город</th><th>Телефон</th><th>Статус</th><th></th></tr></thead><tbody>{items.map(p => <tr key={p.id}><td>{p.name || `Точка #${p.id}`}</td><td>{p.address || "—"}</td><td>{p.city || "—"}</td><td>{p.phone || "—"}</td><td><span className={`badge ${p.isActive === false ? "badge-off" : "badge-on"}`}>{p.isActive === false ? "Скрыта" : "Активна"}</span></td><td><div className={styles.rowActions}><button className="btn btn-sm btn-map" onClick={() => openYandexMap(p)} title="Открыть точку в Яндекс Картах">⌖ Яндекс Карта</button><button className="btn btn-sm" onClick={() => edit(p)}>Изменить</button><button className="btn btn-sm btn-danger" onClick={() => remove(p)}>Удалить</button></div></td></tr>)}</tbody></table>}</div>
    {open && <Modal title={editing ? "Изменить точку" : "Новая точка выдачи"} onClose={() => setOpen(false)}><form onSubmit={save}>{["name","address","city","phone","latitude","longitude"].map(k => <div className="field" key={k}><label>{({name:"Название",address:"Адрес",city:"Город",phone:"Телефон",latitude:"Широта",longitude:"Долгота"})[k]}</label><input value={form[k] ?? ""} onChange={e => setForm({...form,[k]:e.target.value})} required={k === "name" || k === "address"}/></div>)}{error && <p className="error-text">{error}</p>}<div className={styles.modalActions}><button type="button" className="btn" onClick={() => setOpen(false)}>Отмена</button><button className="btn btn-primary">Сохранить</button></div></form></Modal>}
  </Layout>;
}
