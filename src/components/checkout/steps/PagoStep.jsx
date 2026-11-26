import { useState } from "react";

const PAYMENTS = [
  {
    key: "tarjeta",
    icon: "credit_card",
    label: "Tarjeta de Crédito",
    detail: "3 cuotas sin interés",
    detailClass: "text-primary",
  },
  {
    key: "mercadopago",
    icon: "account_balance_wallet",
    label: "Mercado Pago",
    detail: "Saldo o débito directo",
    detailClass: "text-ivory-muted",
  },
  {
    key: "transferencia",
    icon: "payments",
    label: "Transferencia",
    detail: "Comprobante adjunto",
    detailClass: "text-ivory-muted",
  },
];

export default function PagoStep({
  pay,
  onChangePay,
  card,
  onChangeCard,
  receipt,
  onChangeReceipt,
  errors,
}) {
  const [receiptError, setReceiptError] = useState("");

  const selectReceipt = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setReceiptError("El comprobante debe ser una imagen o un PDF.");
      return;
    }
    if (!file.size) {
      setReceiptError("El archivo está vacío. Probá con otro.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setReceiptError("El archivo no puede superar los 2 MB.");
      return;
    }
    // Se conserva el File para subirlo después de crear la compra: el backend
    // necesita el id para asociar el comprobante.
    setReceiptError("");
    onChangeReceipt({
      name: file.name,
      type: file.type,
      size: file.size,
      file,
    });
  };

  return (
    <section
      className="wizard-step rounded-xl border border-outline-border bg-surface-dark p-5 sm:p-6 flex flex-col gap-5"
      aria-label="Método de pago"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PAYMENTS.map((payment) => (
          <button
            key={payment.key}
            type="button"
            onClick={() => onChangePay(payment.key)}
            aria-pressed={pay === payment.key}
            className={`payment-tab ${pay === payment.key ? "is-active" : ""}`}
          >
            <span className="material-symbols-outlined text-lg text-secondary">
              {payment.icon}
            </span>
            <span className="text-xs font-bold">{payment.label}</span>
            <span className={`text-[10px] ${payment.detailClass}`}>
              {payment.detail}
            </span>
          </button>
        ))}
      </div>

      {pay === "tarjeta" ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="form-label" htmlFor="card-number">
                Número de tarjeta
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-secondary text-base">
                  credit_card
                </span>
                <input
                  id="card-number"
                  className={`form-input input-with-icon font-mono tracking-wider ${
                    errors.number ? "form-error" : ""
                  }`}
                  type="text"
                  inputMode="numeric"
                  placeholder="4517 0000 0000 0000"
                  maxLength={19}
                  autoComplete="cc-number"
                  value={card.number}
                  onChange={(event) =>
                    onChangeCard("number", event.target.value)
                  }
                  aria-invalid={Boolean(errors.number)}
                  aria-describedby={
                    errors.number ? "error-card-number" : undefined
                  }
                />
              </div>
              {errors.number ? (
                <p id="error-card-number" className="field-error">
                  {errors.number}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="form-label" htmlFor="card-name">
                Titular como figura en el plástico
              </label>
              <input
                id="card-name"
                className={`form-input uppercase ${
                  errors.name ? "form-error" : ""
                }`}
                maxLength={80}
                type="text"
                placeholder="NOMBRE APELLIDO"
                autoComplete="cc-name"
                value={card.name}
                onChange={(event) => onChangeCard("name", event.target.value)}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "error-card-name" : undefined}
              />
              {errors.name ? (
                <p id="error-card-name" className="field-error">
                  {errors.name}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="form-label" htmlFor="card-exp">
                Vencimiento
              </label>
              <input
                id="card-exp"
                className={`form-input text-center ${
                  errors.exp ? "form-error" : ""
                }`}
                type="text"
                placeholder="MM / AA"
                inputMode="numeric"
                autoComplete="cc-exp"
                maxLength={7}
                value={card.exp}
                onChange={(event) => onChangeCard("exp", event.target.value)}
                aria-invalid={Boolean(errors.exp)}
                aria-describedby={errors.exp ? "error-card-exp" : undefined}
              />
              {errors.exp ? (
                <p id="error-card-exp" className="field-error">
                  {errors.exp}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="form-label" htmlFor="card-cvv">
                CVV
              </label>
              <input
                id="card-cvv"
                className={`form-input text-center ${
                  errors.cvv ? "form-error" : ""
                }`}
                type="password"
                placeholder="•••"
                inputMode="numeric"
                autoComplete="cc-csc"
                maxLength={4}
                value={card.cvv}
                onChange={(event) => onChangeCard("cvv", event.target.value)}
                aria-invalid={Boolean(errors.cvv)}
                aria-describedby={errors.cvv ? "error-card-cvv" : undefined}
              />
              {errors.cvv ? (
                <p id="error-card-cvv" className="field-error">
                  {errors.cvv}
                </p>
              ) : null}
            </div>
          </div>
          <p className="text-[11px] text-ivory-muted flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-base">
              shield
            </span>
            Simulación de pago: no se realiza ningún cargo real.
          </p>
        </div>
      ) : null}

      {pay === "mercadopago" ? (
        <div className="rounded-xl border border-outline-border bg-surface-card p-5 flex flex-col gap-2">
          <p className="text-sm font-bold text-ivory-text flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">
              account_balance_wallet
            </span>
            Pago con Mercado Pago
          </p>
          <p className="text-xs text-ivory-muted leading-relaxed">
            Al confirmar, se simula la apertura del checkout de Mercado Pago.
            Podés pagar con saldo disponible o tarjeta asociada. El prototipo no
            redirige a un sitio externo.
          </p>
        </div>
      ) : null}

      {pay === "transferencia" ? (
        <div className="rounded-xl border border-outline-border bg-surface-card p-5 flex flex-col gap-3">
          <p className="text-sm font-bold text-ivory-text flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">
              payments
            </span>
            Transferencia Bancaria
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg bg-surface-dark border border-outline-border p-3">
              <span className="block text-[10px] uppercase tracking-wider text-ivory-muted">
                Alias
              </span>
              <span className="font-mono font-bold text-secondary">
                MULTITEATRO.FLORES
              </span>
            </div>
            <div className="rounded-lg bg-surface-dark border border-outline-border p-3">
              <span className="block text-[10px] uppercase tracking-wider text-ivory-muted">
                CBU
              </span>
              <span className="font-mono font-bold text-ivory-text">
                0000003100012345678901
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="form-label">Comprobante de transferencia</span>
            <label
              htmlFor="comprobante"
              className="inline-flex w-fit items-center gap-2 px-3.5 py-2 rounded-lg border border-outline-border bg-surface-dark hover:bg-surface-elevated text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-base text-secondary">
                upload_file
              </span>
              {receipt ? "Cambiar comprobante" : "Adjuntar comprobante"}
            </label>
            <input
              id="comprobante"
              type="file"
              accept="image/*,application/pdf"
              className="sr-only"
              onChange={selectReceipt}
            />
            {receipt ? (
              <p className="text-[11px] text-primary break-all">
                Adjunto: {receipt.name}
              </p>
            ) : null}
            {receiptError ? <p className="field-error">{receiptError}</p> : null}
            {errors.receipt ? (
              <p className="field-error">{errors.receipt}</p>
            ) : null}
          </div>

          <p className="text-[11px] text-ivory-muted">
            La reserva queda confirmada al validarse la transferencia. El
            comprobante se sube al servidor y queda asociado a la compra.
          </p>
        </div>
      ) : null}

      <div className="flex items-start gap-2 text-[11px] text-ivory-muted">
        <span className="material-symbols-outlined text-secondary text-base">
          lock
        </span>
        Los datos de la tarjeta no se envían: el pago es simulado. La compra y
        las butacas se registran en el servidor.
      </div>
    </section>
  );
}
