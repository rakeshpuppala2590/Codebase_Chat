// components/MultiNamespaceSelector.js
import { FiGithub } from "react-icons/fi";

const MultiNamespaceSelector = ({
  namespaces,
  selectedNamespaces,
  onSelect,
  onStartChat,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FiGithub />
          Select Repositories
        </h2>
        <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
          {namespaces.map((ns) => (
            <label
              key={ns}
              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
            >
              <input
                type="checkbox"
                checked={selectedNamespaces.includes(ns)}
                onChange={() => onSelect(ns)}
                className="h-4 w-4"
              />
              <span>{ns.split("/").pop()}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onStartChat}
            disabled={selectedNamespaces.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
          >
            Start Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiNamespaceSelector;
