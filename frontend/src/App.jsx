import "./App.css";
import { useState } from "react";
import axios from "axios";

function App() {
  const [emailContent, setEmailContent] = useState("");
  const [tone, setTone] = useState("");
  const [generatedReply, setGeneratedReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!emailContent || emailContent == "" || !emailContent.trim()) {
      setError("Email content must not be empty!");
      return;
    }
    setLoading(true);
    setError("");
    setGeneratedReply("");

    try {
      const response = await axios.post(
        "http://localhost:8145/api/email/generate",
        {
          emailContent,
          tone,
        }
      );

      setGeneratedReply(
        typeof response.data === "string"
          ? response.data
          : JSON.stringify(response.data, null, 2)
      );
    } catch (err) {
      setError("Failed to generate email reply. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedReply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          ✉️ Email Reply Generator
        </h1>

        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="6"
          placeholder="Enter the original email content..."
          value={emailContent}
          onChange={(e) => setEmailContent(e.target.value)}
        />

        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">
            Tone (optional)
          </label>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          >
            <option value="">None</option>
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="friendly">Friendly</option>
            <option value="apologetic">Apologetic</option>
            <option value="enthusiastic">Enthusiastic</option>
          </select>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!emailContent || loading}
          className={`w-full bg-blue-600 text-white font-semibold py-3 rounded-lg transition duration-200 ${
            loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          {loading ? "Generating..." : "Generate Reply"}
        </button>

        {error && <div className="mt-4 text-red-600 font-medium">{error}</div>}

        {generatedReply && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              Generated Reply:
            </h2>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg mb-3 resize-none bg-gray-50"
              rows="6"
              value={generatedReply}
            />
            <button
              onClick={handleCopy}
              className="w-full border border-blue-600 text-blue-600 font-semibold py-2 rounded-lg hover:bg-blue-50 transition"
            >
              {copied ? "Copied!" : "Copy to Clipboard"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
