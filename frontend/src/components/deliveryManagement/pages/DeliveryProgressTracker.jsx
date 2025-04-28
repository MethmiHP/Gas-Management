import React from 'react';
import { CheckCircle, Clock, Truck, Package, XCircle } from 'lucide-react';

const DeliveryProgressTracker = ({ status }) => {
  // Define the delivery stages in order
  const stages = [
    { key: 'Pending', icon: Clock, label: 'Pending' },
    { key: 'Assigned', icon: Package, label: 'Order Assigned' },
    { key: 'Out For Delivery', icon: Truck, label: 'Out For Delivery' },
    { key: 'Delivered', icon: CheckCircle, label: 'Delivered' }
  ];

  // Handle failed delivery separately
  if (status === 'Delivery Failed') {
    return (
      <div className="my-8">
        <div className="flex items-center justify-center">
          <XCircle size={48} className="text-red-500" />
          <span className="ml-2 text-lg font-medium text-red-500">Delivery Failed</span>
        </div>
      </div>
    );
  }

  // Find the current stage index
  const currentStageIndex = stages.findIndex(stage => stage.key === status);

  return (
    <div className="my-8">
      <div className="flex justify-between items-center w-full">
        {stages.map((stage, index) => {
          // Determine if this stage is active, completed, or upcoming
          const isActive = index === currentStageIndex;
          const isCompleted = index < currentStageIndex;
          const isUpcoming = index > currentStageIndex;

          // Choose the appropriate styling based on stage status
          let iconColor = "text-gray-300"; // Default for upcoming stages
          if (isActive) iconColor = "text-blue-500";
          if (isCompleted) iconColor = "text-green-500";

          const StageIcon = stage.icon;

          return (
            <div key={stage.key} className="flex flex-col items-center">
              <div className={`rounded-full p-2 ${isActive ? 'bg-blue-100' : isCompleted ? 'bg-green-100' : 'bg-gray-100'}`}>
                <StageIcon className={iconColor} size={24} />
              </div>
              <span className={`text-sm mt-2 font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Connection lines between icons */}
      <div className="relative flex justify-center mt-4">
        <div className="absolute top-0 h-0.5 w-full bg-gray-200 -z-10"></div>
        <div 
          className="absolute top-0 h-0.5 bg-green-500 -z-5"
          style={{ 
            width: `${currentStageIndex >= 0 ? (currentStageIndex / (stages.length - 1)) * 100 : 0}%` 
          }}
        ></div>
      </div>
    </div>
  );
};

export default DeliveryProgressTracker;