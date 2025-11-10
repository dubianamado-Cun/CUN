
import React from 'react';

interface TreemapDataNode {
  name: string;
  value: number;
  children?: TreemapDataNode[];
}

interface TreemapProps {
  data: TreemapDataNode;
  comparisonData: TreemapDataNode | null;
  comparisonYears: { current: number; previous: number } | null;
}

const COLORS = ['#10b981', '#3b82f6', '#ec4899', '#f97316', '#8b5cf6', '#eab308', '#ef4444', '#22c55e'];

// FIX: Wrap the recursive component in React.memo to prevent re-renders if props haven't changed.
// This is a standard optimization for recursive components and can break potential infinite render loops
// which are a common cause of "Maximum call stack size exceeded" errors in React.
const TreemapNode: React.FC<{ node: TreemapDataNode; color: string; isRoot?: boolean }> = React.memo(({ node, color, isRoot = false }) => {
  const hasChildren = node.children && node.children.length > 0;
  // Memoization inside the component is also good practice, though React.memo provides the bigger win.
  const sortedChildren = React.useMemo(() => 
    hasChildren ? [...node.children!].sort((a, b) => b.value - a.value) : [],
    [node.children, hasChildren]
  );
  
  if (hasChildren) {
    return (
      <div 
        className={`relative w-full h-full p-1 border rounded-md transition-all duration-200 ${isRoot ? 'border-transparent' : 'border-white/50'}`}
        style={{ backgroundColor: color }}
      >
        <div className="absolute top-1.5 left-2 right-2 flex justify-between items-center text-white">
            <span className="font-bold text-sm truncate" title={node.name} style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                {node.name}
            </span>
            <span className="text-xs opacity-90 font-medium" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
                {node.value.toLocaleString()} tickets
            </span>
        </div>
        <div className="w-full h-full flex flex-col pt-8 space-y-0.5">
          {sortedChildren.map((child) => (
            <div key={child.name} style={{ flexGrow: child.value, minHeight: '24px' }}>
              <TreemapNode node={child} color="rgba(255, 255, 255, 0.15)" />
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    return (
       <div 
            className="w-full h-full p-2 flex flex-col justify-center rounded-md"
            style={{ backgroundColor: color }}
        >
            <div className="text-white font-bold text-xs truncate" title={node.name} style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                {node.name}
            </div>
            <div className="text-white text-[10px] opacity-80" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
                {node.value.toLocaleString()}
            </div>
        </div>
    );
  }
});

const TreemapRoot: React.FC<{rootNode: TreemapDataNode}> = ({ rootNode }) => {
    if (!rootNode.children || rootNode.children.length === 0) {
        return <div className="flex-1 flex items-center justify-center text-text-secondary">No hay datos.</div>;
    }
    
    return (
         <div className="h-full flex space-x-2 flex-1 min-w-[400px]">
            {rootNode.children.map((child, index) => {
                 // Use a logarithmic scale to prevent one category from dominating the view.
                // It provides a base width and adds to it based on the magnitude of the value.
                // This ensures multiple categories are visible at once.
                const width = 200 + Math.log(child.value + 1) * 30; // Add 1 to avoid log(0), base width 200px, factor 30
                return (
                    <div
                        key={child.name}
                        style={{
                            width: `${width}px`,
                            flexShrink: 0
                        }}
                    >
                        <TreemapNode node={child} color={COLORS[index % COLORS.length]} isRoot />
                    </div>
                );
            })}
        </div>
    )
}

const Treemap: React.FC<TreemapProps> = ({ data, comparisonData, comparisonYears }) => {
    if (!data || !data.children || data.children.length === 0) {
        return <div className="flex items-center justify-center h-[500px] text-text-secondary">No hay datos para mostrar el treemap.</div>;
    }

    return (
        <div className="w-full h-[500px] overflow-x-auto bg-gray-50 rounded-lg p-2">
            <div className="h-full flex gap-4">
                <div className="flex flex-col flex-1">
                    {comparisonYears && <h4 className="font-bold text-center mb-1">{comparisonYears.current}</h4>}
                    <TreemapRoot rootNode={data} />
                </div>
                {comparisonData && comparisonYears && (
                    <div className="flex flex-col flex-1 border-l pl-4">
                         <h4 className="font-bold text-center mb-1">{comparisonYears.previous}</h4>
                        <TreemapRoot rootNode={comparisonData} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Treemap;