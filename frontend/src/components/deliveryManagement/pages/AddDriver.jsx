// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const AddDriver = () => {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [licenseNumber, setLicenseNumber] = useState("");
//   const navigate = useNavigate();

// //   const handleSubmit = (e) => {
// //     e.preventDefault();
// //     const driverData = { name, email, phone, licenseNumber };
// //     // axios
// //     //   .post("http://localhost:5000/drivers", driverData)
// //       axios
// //   .post("http://localhost:5000/drivers", driverData, {
// //     headers: { "Content-Type": "application/json" },
// //   })

// //       .then(() => {
// //         alert("Driver added successfully!");
// //         navigate("/drivers");
// //       })
// //       .catch((error) => {
// //         alert("Error adding driver");
// //         console.error("Error adding driver:", error);
// //       });
// //   };

// const handleSubmit = (e) => {
//     e.preventDefault();
    
//     // Ensure all required fields have values
//     if (!name || !email || !phone || !licenseNumber) {
//       alert("Please fill all fields!");
//       return;
//     }
  
//     const driverData = { name, email, phone, licenseNumber };
  
//     axios
//       .post("http://localhost:5000/drivers", driverData, {
//         headers: { "Content-Type": "application/json" },
//       })
//       .then(() => {
//         alert("Driver added successfully!");
//         navigate("/drivers");
//       })
//       .catch((error) => {
//         console.error("Error adding driver:", error.response?.data || error);
//         alert(`Error adding driver: ${error.response?.data?.message || "Unknown error"}`);
//       });
//   };
  

//   return (
//     <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
//       <h2 className="text-2xl font-bold mb-4 text-center">Add Driver</h2>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium">Name</label>
//           <input
//             type="text"
//             placeholder="Enter driver's name"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">Email</label>
//           <input
//             type="email"
//             placeholder="Enter driver's email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">Phone</label>
//           <input
//             type="text"
//             placeholder="Enter driver's phone number"
//             value={phone}
//             onChange={(e) => setPhone(e.target.value)}
//             className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">License Number</label>
//           <input
//             type="text"
//             placeholder="Enter driver's license number"
//             value={licenseNumber}
//             onChange={(e) => setLicenseNumber(e.target.value)}
//             className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             required
//           />
//         </div>
//         <div className="flex justify-between">
//           <button
//             type="submit"
//             className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Add Driver
//           </button>
//           <button
//             type="button"
//             className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
//             onClick={() => navigate("/drivers")}
//           >
//             Cancel
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AddDriver;

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddDriver = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Validation function
  const validateForm = () => {
    let newErrors = {};

    // Name Validation: Only letters (spaces allowed)
    if (!/^[A-Za-z\s]+$/.test(name.trim())) {
      newErrors.name = "Name must contain only letters and spaces.";
    }

    // Email Validation: Must be a proper email format
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      newErrors.email = "Invalid email format (e.g., example@gmail.com).";
    }

    // Phone Validation: Only numbers, at least 10 digits
    if (!/^\d{10,}$/.test(phone)) {
      newErrors.phone = "Phone number must be at least 10 digits long.";
    }

    // License Number Validation: Ensures it's in a valid format
    if (!/^[A-Z0-9-]+$/.test(licenseNumber)) {
      newErrors.licenseNumber = "License number must be alphanumeric (A-Z, 0-9, -).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // Stop submission if validation fails
    }

    const driverData = { name, email, phone, licenseNumber };

    axios
      .post("http://localhost:5000/drivers", driverData, {
        headers: { "Content-Type": "application/json" },
      })
      .then(() => {
        alert("Driver added successfully!");
        navigate("/drivers");
      })
      .catch((error) => {
        console.error("Error adding driver:", error.response?.data || error);
        alert(`Error adding driver: ${error.response?.data?.message || "Unknown error"}`);
      });
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Add Driver</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            placeholder="Enter driver's name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            placeholder="Enter driver's email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Phone</label>
          <input
            type="text"
            placeholder="Enter driver's phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">License Number</label>
          <input
            type="text"
            placeholder="Enter driver's license number"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.licenseNumber && <p className="text-red-500 text-sm">{errors.licenseNumber}</p>}
        </div>

        <div className="flex justify-between">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Driver
          </button>
          <button
            type="button"
            className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
            onClick={() => navigate("/drivers")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDriver;

