import { useMemo, useRef, useState } from "react";
import {
  Check,
  FileText,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Upload,
  UserPlus,
  X,
} from "lucide-react";
import Tesseract from "tesseract.js";
import "./customer-import.css";

const emptyCustomer = {
  name: "",
  phone: "",
  email: "",
  company: "",
  status: "Active",
  notes: "",
};

function cleanValue(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/^[:\-–—\s]+/, "")
    .trim();
}

function extractCustomerFromText(text) {
  const source = String(text || "").replace(/\r/g, "\n");

  const lines = source
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const emailMatch = source.match(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
  );

  const phoneMatches = source.match(
    /(?:\+?\d[\d\s().-]{8,}\d)/g
  );

  const phone = phoneMatches?.[0]
    ? cleanValue(phoneMatches[0])
    : "";

  const companyMatch = source.match(
    /(?:company|organization|organisation|business|firm)\s*[:\-]\s*(.+)/i
  );

  const nameMatch = source.match(
    /(?:name|customer|contact|person)\s*[:\-]\s*([^\n]+)/i
  );

  let name = nameMatch?.[1]
    ? cleanValue(nameMatch[1])
    : "";

  if (!name) {
    const ignored = [
      "customer details",
      "customer information",
      "contact details",
      "contact information",
      "name",
      "phone",
      "mobile",
      "email",
      "company",
      "organization",
      "organisation",
      "business",
      "notes",
    ];

    const possibleName = lines.find((line) => {
      const lower = line.toLowerCase();

      if (ignored.some((item) => lower === item)) return false;
      if (line.includes("@")) return false;
      if (/\d{7,}/.test(line)) return false;
      if (/^(name|phone|mobile|email|company|organization|business)\s*[:\-]/i.test(line)) {
        return false;
      }

      return /^[A-Za-z][A-Za-z .'-]{2,50}$/.test(line);
    });

    name = possibleName || "";
  }

  let company = companyMatch?.[1]
    ? cleanValue(companyMatch[1])
    : "";

  if (!company) {
    const companyLine = lines.find((line) =>
      /(?:pvt|private|ltd|limited|solutions|technologies|enterprises|industries|services|systems|traders|agency|company)/i.test(
        line
      )
    );

    company = companyLine || "";
  }

  const notesMatch = source.match(
    /(?:notes?|remarks?|comment|requirement|interest)\s*[:\-]\s*([^\n]+)/i
  );

  const notes = notesMatch?.[1]
    ? cleanValue(notesMatch[1])
    : "";

  return {
    ...emptyCustomer,
    name,
    phone,
    email: emailMatch?.[0] || "",
    company,
    notes,
  };
}

function CustomerImport({ onClose, onImport }) {
  const [method, setMethod] = useState("text");
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [customers, setCustomers] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  const hasCustomers = customers.length > 0;

  const validCustomers = useMemo(
    () =>
      customers.filter(
        (customer) =>
          customer.name.trim() && customer.phone.trim()
      ),
    [customers]
  );

  const switchMethod = (nextMethod) => {
    if (processing) return;

    setMethod(nextMethod);
    setError("");
    setCustomers([]);

    if (nextMethod === "text") {
      setSelectedFile(null);
      setPreviewImage("");
    } else {
      setText("");
    }
  };

  const processText = () => {
    setError("");

    if (!text.trim()) {
      setError("Please paste customer information first.");
      return;
    }

    const blocks = text
      .split(/\n\s*\n+/)
      .map((block) => block.trim())
      .filter(Boolean);

    const extracted = blocks.map(extractCustomerFromText);

    const usable = extracted.filter(
      (customer) =>
        customer.name.trim() ||
        customer.phone.trim() ||
        customer.email.trim()
    );

    if (!usable.length) {
      setError(
        "Customer details could not be detected. Try a format like Name, Phone, Email and Company."
      );
      return;
    }

    setCustomers(usable);
  };

  const processImage = async (file) => {
    if (!file) return;

    setError("");
    setProcessing(true);
    setCustomers([]);

    try {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      setSelectedFile(file);

      const result = await Tesseract.recognize(
        file,
        "eng",
        {
          logger: (message) => {
            if (message.status === "recognizing text") {
              const percent = Math.round(
                (message.progress || 0) * 100
              );
              console.log(`OCR ${percent}%`);
            }
          },
        }
      );

      const extractedText = result?.data?.text || "";

      if (!extractedText.trim()) {
        throw new Error(
          "No readable text found in this image."
        );
      }

      const extracted = extractCustomerFromText(extractedText);

      if (
        !extracted.name &&
        !extracted.phone &&
        !extracted.email
      ) {
        throw new Error(
          "Could not detect customer details from the photo."
        );
      }

      setCustomers([extracted]);
    } catch (ocrError) {
      console.error(ocrError);
      setError(
        ocrError.message ||
          "Unable to read the photo. Please try a clearer image."
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    processImage(file);
  };

  const handleFileInput = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      handleFile(file);
    }

    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  const updateCustomer = (index, field, value) => {
    setCustomers((current) =>
      current.map((customer, customerIndex) =>
        customerIndex === index
          ? {
              ...customer,
              [field]: value,
            }
          : customer
      )
    );
  };

  const removeCustomer = (index) => {
    setCustomers((current) =>
      current.filter((_, customerIndex) => customerIndex !== index)
    );
  };

  const handleImport = async () => {
    if (!validCustomers.length) {
      setError(
        "Name and phone are required before importing."
      );
      return;
    }

    setProcessing(true);
    setError("");

    try {
      await onImport(validCustomers);
      onClose();
    } catch (importError) {
      console.error(importError);
      setError(
        importError.message ||
          "Unable to import customers."
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      className="import-backdrop"
      onMouseDown={onClose}
    >
      <div
        className="customer-import-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="import-header">
          <div className="import-title-area">
            <div className="import-title-icon">
              <Sparkles size={22} />
            </div>

            <div>
              <div className="import-eyebrow">
                SMART CUSTOMER IMPORT
              </div>

              <h2>Bring customers in instantly</h2>

              <p>
                Paste customer details or scan a photo.
                We will organize the information for you.
              </p>
            </div>
          </div>

          <button
            className="import-close"
            onClick={onClose}
            disabled={processing}
          >
            <X size={20} />
          </button>
        </div>

        <div className="import-method-grid">
          <button
            type="button"
            className={`import-method-card ${
              method === "text" ? "selected" : ""
            }`}
            onClick={() => switchMethod("text")}
            disabled={processing}
          >
            <div className="method-radio">
              {method === "text" && <span />}
            </div>

            <div className="method-icon text-method">
              <FileText size={25} />
            </div>

            <div className="method-content">
              <strong>Paste Text</strong>
              <span>
                Copy customer details from WhatsApp,
                Excel, email or any text.
              </span>
            </div>

            {method === "text" && (
              <div className="method-check">
                <Check size={15} />
              </div>
            )}
          </button>

          <button
            type="button"
            className={`import-method-card ${
              method === "photo" ? "selected" : ""
            }`}
            onClick={() => switchMethod("photo")}
            disabled={processing}
          >
            <div className="method-radio">
              {method === "photo" && <span />}
            </div>

            <div className="method-icon photo-method">
              <ImageIcon size={25} />
            </div>

            <div className="method-content">
              <strong>Upload Photo</strong>
              <span>
                Scan a visiting card, customer list or
                screenshot automatically.
              </span>
            </div>

            {method === "photo" && (
              <div className="method-check">
                <Check size={15} />
              </div>
            )}
          </button>
        </div>

        <div className="import-workspace">
          {method === "text" && (
            <div className="text-import-area">
              <div className="workspace-heading">
                <div>
                  <h3>Paste customer information</h3>
                  <p>
                    Multiple customers can be separated by a
                    blank line.
                  </p>
                </div>

                <span className="smart-pill">
                  <Sparkles size={13} />
                  AI Ready
                </span>
              </div>

              <textarea
                className="smart-textarea"
                value={text}
                onChange={(event) => {
                  setText(event.target.value);
                  setError("");
                }}
                placeholder={`Example:

Name: Rahul Sharma
Phone: +91 98765 43210
Email: rahul@example.com
Company: Sharma Enterprises
Notes: Interested in premium plan`}
                disabled={processing}
              />

              <div className="textarea-footer">
                <span>
                  {text.length} characters
                </span>

                <button
                  className="extract-button"
                  onClick={processText}
                  disabled={processing || !text.trim()}
                >
                  <Sparkles size={16} />
                  Extract Details
                </button>
              </div>
            </div>
          )}

          {method === "photo" && (
            <div className="photo-import-area">
              {!previewImage ? (
                <div
                  className={`photo-dropzone ${
                    dragging ? "dragging" : ""
                  }`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFileInput}
                  />

                  <div className="upload-orb">
                    <Upload size={27} />
                  </div>

                  <h3>
                    Drop your customer photo here
                  </h3>

                  <p>
                    or click to browse from your computer
                  </p>

                  <span>
                    JPG, PNG, WEBP • Clear images work best
                  </span>
                </div>
              ) : (
                <div className="photo-preview-layout">
                  <div className="photo-preview-card">
                    <img
                      src={previewImage}
                      alt="Customer source"
                    />

                    <button
                      className="replace-photo-button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      disabled={processing}
                    >
                      <Upload size={15} />
                      Replace Photo
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleFileInput}
                    />
                  </div>

                  <div className="ocr-status-card">
                    {processing ? (
                      <>
                        <div className="ocr-loader">
                          <Loader2
                            size={28}
                            className="spin"
                          />
                        </div>

                        <h3>Reading your photo...</h3>

                        <p>
                          OCR is detecting names, phone
                          numbers and contact details.
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="ocr-success">
                          <Check size={25} />
                        </div>

                        <h3>Photo processed</h3>

                        <p>
                          Review the detected details below
                          before adding them.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="import-error">
            {error}
          </div>
        )}

        {hasCustomers && (
          <div className="import-preview">
            <div className="preview-heading">
              <div>
                <h3>Review detected customers</h3>
                <p>
                  {validCustomers.length} customer
                  {validCustomers.length !== 1 ? "s" : ""} ready
                  to import
                </p>
              </div>

              <span className="detected-badge">
                <Check size={14} />
                Detected
              </span>
            </div>

            <div className="detected-list">
              {customers.map((customer, index) => (
                <div
                  className="detected-customer-card"
                  key={`${customer.phone}-${index}`}
                >
                  <div className="detected-avatar">
                    {customer.name
                      ?.charAt(0)
                      ?.toUpperCase() || "C"}
                  </div>

                  <div className="detected-fields">
                    <input
                      value={customer.name}
                      onChange={(event) =>
                        updateCustomer(
                          index,
                          "name",
                          event.target.value
                        )
                      }
                      placeholder="Customer name"
                    />

                    <div className="detected-field-row">
                      <input
                        value={customer.phone}
                        onChange={(event) =>
                          updateCustomer(
                            index,
                            "phone",
                            event.target.value
                          )
                        }
                        placeholder="Phone number"
                      />

                      <input
                        value={customer.email}
                        onChange={(event) =>
                          updateCustomer(
                            index,
                            "email",
                            event.target.value
                          )
                        }
                        placeholder="Email"
                      />
                    </div>

                    <div className="detected-field-row">
                      <input
                        value={customer.company}
                        onChange={(event) =>
                          updateCustomer(
                            index,
                            "company",
                            event.target.value
                          )
                        }
                        placeholder="Company"
                      />

                      <input
                        value={customer.notes}
                        onChange={(event) =>
                          updateCustomer(
                            index,
                            "notes",
                            event.target.value
                          )
                        }
                        placeholder="Notes"
                      />
                    </div>
                  </div>

                  <button
                    className="remove-detected"
                    onClick={() =>
                      removeCustomer(index)
                    }
                    title="Remove"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="import-footer">
          <div className="import-footer-info">
            <UserPlus size={17} />
            <span>
              Data will be saved to your customer database
            </span>
          </div>

          <div className="import-footer-actions">
            <button
              className="secondary-import-button"
              onClick={onClose}
              disabled={processing}
            >
              Cancel
            </button>

            <button
              className="primary-import-button"
              onClick={handleImport}
              disabled={
                processing || !validCustomers.length
              }
            >
              {processing ? (
                <>
                  <Loader2 size={17} className="spin" />
                  Processing...
                </>
              ) : (
                <>
                  <UserPlus size={17} />
                  Confirm & Add{" "}
                  {validCustomers.length || ""}
                  {validCustomers.length === 1
                    ? " Customer"
                    : " Customers"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerImport;