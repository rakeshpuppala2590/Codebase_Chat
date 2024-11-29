// components/Sidebar.js
import { FiGithub } from "react-icons/fi";

const Sidebar = ({ namespaces, selectedNamespace, onSelect }) => {
  const getRepoName = (url) => {
    if (!url) return "";
    const parts = url.split("/");
    return parts[parts.length - 1];
  };

  return (
    <div className="w-64 h-full bg-gray-50 p-6 border-r border-gray-200">
      <div className="flex items-center gap-3 mb-8">
        <FiGithub className="w-6 h-6" />
        <h2 className="text-xl font-semibold text-gray-800">Repositories</h2>
      </div>

      <ul className="space-y-3">
        {namespaces.map((ns) => (
          <li
            key={ns}
            className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all
              ${
                selectedNamespace === ns
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            onClick={() => onSelect(ns)}
          >
            <FiGithub className="w-4 h-4 mr-3 opacity-75" />
            <span className="font-medium">{getRepoName(ns)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
