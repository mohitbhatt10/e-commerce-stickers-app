import React, { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import {
  Form,
  useLoaderData,
  useActionData,
  useNavigation,
  useNavigate,
} from "react-router-dom";
import PageTitle from "./PageTitle";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { loginSuccess, logout } from "../store/auth-slice";
import { Country, State, City } from "country-state-city";

export default function Profile() {
  const initialProfileData = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const isSubmitting = navigation.state === "submitting";
  const dispatch = useDispatch();

  const [profileData, setProfileData] = useState(initialProfileData);
  const [selectedCountryCode, setSelectedCountryCode] = useState(() => {
    const countryValue = initialProfileData?.address?.country;
    if (!countryValue) return "";
    const match = Country.getAllCountries().find(
      (c) => c.isoCode === countryValue || c.name === countryValue
    );
    return match?.isoCode || "";
  });
  const [selectedStateCode, setSelectedStateCode] = useState(() => {
    const countryValue = initialProfileData?.address?.country;
    const stateValue = initialProfileData?.address?.state;
    if (!countryValue || !stateValue) return "";
    const countryMatch = Country.getAllCountries().find(
      (c) => c.isoCode === countryValue || c.name === countryValue
    );
    if (!countryMatch) return "";
    const stateMatch = State.getStatesOfCountry(countryMatch.isoCode).find(
      (s) => s.isoCode === stateValue || s.name === stateValue
    );
    return stateMatch?.isoCode || "";
  });
  const [selectedStateName, setSelectedStateName] = useState(
    initialProfileData?.address?.state || ""
  );
  const [selectedCityName, setSelectedCityName] = useState(
    initialProfileData?.address?.city || ""
  );

  useEffect(() => {
    if (actionData?.success) {
      if (actionData.profileData.emailUpdated) {
        sessionStorage.setItem("skipRedirectPath", "true");
        dispatch(logout());
        toast.success(
          "Logged out successfully! Login again with updated email"
        );
        navigate("/login");
      } else {
        toast.success("Your Profile details are saved successfully!");
        setProfileData(actionData.profileData);
        // Update the user object in auth context and localStorage
        if (actionData.profileData) {
          const updatedUser = {
            ...profileData, // previous
            ...actionData.profileData, // updated fields
          };
          // Update in context
          dispatch(
            loginSuccess({
              jwtToken: localStorage.getItem("jwtToken"),
              user: updatedUser,
            })
          );
        }
      }
    }
  }, [actionData]);

  useEffect(() => {
    const countryValue = profileData?.address?.country;
    const countryMatch = Country.getAllCountries().find(
      (c) => c.isoCode === countryValue || c.name === countryValue
    );
    const countryCode = countryMatch?.isoCode || "";
    setSelectedCountryCode(countryCode);

    const states = countryCode
      ? State.getStatesOfCountry(countryCode)
      : [];
    const stateValue = profileData?.address?.state;
    const stateMatch = states.find(
      (s) => s.isoCode === stateValue || s.name === stateValue
    );
    setSelectedStateCode(stateMatch?.isoCode || "");
    setSelectedStateName(stateMatch?.name || stateValue || "");

    const cities = countryCode && stateMatch?.isoCode
      ? City.getCitiesOfState(countryCode, stateMatch.isoCode)
      : [];
    const cityValue = profileData?.address?.city;
    const cityMatch = cities.find((c) => c.name === cityValue);
    setSelectedCityName(cityMatch?.name || cityValue || "");
  }, [profileData?.address?.country, profileData?.address?.state, profileData?.address?.city]);

  const labelStyle =
    "block text-lg font-semibold text-primary dark:text-light mb-2";
  const h2Style =
    "block text-2xl font-semibold text-primary dark:text-light mb-2";
  const textFieldStyle =
    "w-full px-4 py-2 text-base border rounded-md transition border-primary dark:border-light focus:ring focus:ring-dark dark:focus:ring-lighter focus:outline-none text-gray-800 dark:text-lighter bg-white dark:bg-gray-600 placeholder-gray-400 dark:placeholder-gray-300";

  const countries = Country.getAllCountries();
  const states = selectedCountryCode
    ? State.getStatesOfCountry(selectedCountryCode)
    : [];
  const cities = selectedCountryCode && selectedStateCode
    ? City.getCitiesOfState(selectedCountryCode, selectedStateCode)
    : [];

  const handleCountryChange = (e) => {
    const code = e.target.value;
    const countryObj = countries.find((c) => c.isoCode === code);
    setSelectedCountryCode(code);
    setSelectedStateCode("");
    setSelectedStateName("");
    setSelectedCityName("");
    setProfileData((prev) => ({
      ...prev,
      address: {
        ...(prev.address || {}),
        country: countryObj?.isoCode || "",
        state: "",
        city: "",
      },
    }));
  };

  const handleStateChange = (e) => {
    const value = e.target.value;
    const stateObj = states.find(
      (s) => s.name === value || s.isoCode === value
    );
    setSelectedStateCode(stateObj?.isoCode || "");
    setSelectedStateName(stateObj?.name || value || "");
    setSelectedCityName("");
    setProfileData((prev) => ({
      ...prev,
      address: {
        ...(prev.address || {}),
        country: selectedCountryCode || prev.address?.country || "",
        state: stateObj?.name || "",
        city: "",
      },
    }));
  };

  const handleCityChange = (e) => {
    const value = e.target.value;
    setSelectedCityName(value);
    setProfileData((prev) => ({
      ...prev,
      address: {
        ...(prev.address || {}),
        city: value,
      },
    }));
  };

  return (
    <div className="max-w-[1152px] min-h-[852px] mx-auto px-6 py-8 font-primary bg-normalbg dark:bg-darkbg">
      <PageTitle title="My Profile" />

      <Form method="PUT" className="space-y-6 max-w-[768px] mx-auto">
        <div>
          <h2 className={h2Style}>Personal Details</h2>
          <label htmlFor="name" className={labelStyle}>
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Your Name"
            className={textFieldStyle}
            value={profileData.name}
            onChange={(e) =>
              setProfileData((prev) => ({ ...prev, name: e.target.value }))
            }
            required
            minLength={5}
            maxLength={30}
          />
          {actionData?.errors?.name && (
            <p className="text-red-500 text-sm mt-1">
              {actionData.errors.name}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="email" className={labelStyle}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Your Email"
              value={profileData.email}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, email: e.target.value }))
              }
              className={textFieldStyle}
              required
            />
            {actionData?.errors?.email && (
              <p className="text-red-500 text-sm mt-1">
                {actionData.errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="mobileNumber" className={labelStyle}>
              Mobile Number
            </label>
            <input
              id="mobileNumber"
              name="mobileNumber"
              type="tel"
              required
              pattern="^\d{10}$"
              title="Mobile number must be exactly 10 digits"
              value={profileData.mobileNumber}
              onChange={(e) =>
                setProfileData((prev) => ({
                  ...prev,
                  mobileNumber: e.target.value,
                }))
              }
              placeholder="Your Mobile Number"
              className={textFieldStyle}
            />
            {actionData?.errors?.mobileNumber && (
              <p className="text-red-500 text-sm mt-1">
                {actionData.errors.mobileNumber}
              </p>
            )}
          </div>
        </div>

        <div>
          <h2 className={h2Style}>Address Details</h2>
          <label htmlFor="street" className={labelStyle}>
            Street
          </label>
          <input
            id="street"
            name="street"
            type="text"
            placeholder="Street details"
            value={profileData.address?.street}
            onChange={(e) =>
              setProfileData((prev) => ({
                ...prev,
                address: {
                  ...prev.address,
                  street: e.target.value,
                },
              }))
            }
            className={textFieldStyle}
            required
            minLength={5}
            maxLength={30}
          />
          {actionData?.errors?.street && (
            <p className="text-red-500 text-sm mt-1">
              {actionData.errors.street}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="country" className={labelStyle}>
              Country
            </label>
            <select
              id="country"
              name="country"
              required
              value={selectedCountryCode}
              onChange={handleCountryChange}
              className={textFieldStyle}
            >
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country.isoCode} value={country.isoCode}>
                  {country.name}
                </option>
              ))}
            </select>
            {actionData?.errors?.country && (
              <p className="text-red-500 text-sm mt-1">
                {actionData.errors.country}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="state" className={labelStyle}>
              State
            </label>
            <select
              id="state"
              name="state"
              required
              disabled={!selectedCountryCode}
              value={selectedStateName}
              onChange={handleStateChange}
              className={textFieldStyle}
            >
              <option value="" disabled={!selectedCountryCode}>
                {selectedCountryCode ? "Select State" : "Select Country first"}
              </option>
              {states.map((state) => (
                <option key={state.isoCode} value={state.name}>
                  {state.name}
                </option>
              ))}
            </select>
            {actionData?.errors?.state && (
              <p className="text-red-500 text-sm mt-1">
                {actionData.errors.state}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="city" className={labelStyle}>
              City
            </label>
            <select
              id="city"
              name="city"
              required
              disabled={!selectedStateCode}
              value={selectedCityName}
              onChange={handleCityChange}
              className={textFieldStyle}
            >
              <option value="" disabled={!selectedStateCode}>
                {selectedStateCode ? "Select City" : "Select State first"}
              </option>
              {cities.map((city) => (
                <option key={`${city.name}-${city.stateCode}`} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
            {actionData?.errors?.city && (
              <p className="text-red-500 text-sm mt-1">
                {actionData.errors.city}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="postalCode" className={labelStyle}>
              Postal Code
            </label>
            <input
              id="postalCode"
              name="postalCode"
              type="text"
              placeholder="Your Postal Code"
              value={profileData.address?.postalCode}
              disabled={
                !selectedCountryCode || !selectedStateCode || !selectedCityName
              }
              onChange={(e) =>
                setProfileData((prev) => ({
                  ...prev,
                  address: {
                    ...prev.address,
                    postalCode: e.target.value,
                  },
                }))
              }
              className={textFieldStyle}
              required
              pattern="^\d{6}$"
              title="Postal code must be exactly 6 digits"
            />
            {actionData?.errors?.postalCode && (
              <p className="text-red-500 text-sm mt-1">
                {actionData.errors.postalCode}
              </p>
            )}
          </div>
        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 mt-8 text-white dark:text-black text-xl rounded-md transition duration-200 bg-primary dark:bg-light hover:bg-dark dark:hover:bg-lighter"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </Form>
    </div>
  );
}

export async function profileLoader() {
  try {
    const response = await apiClient.get("/profile"); // Axios GET Request
    return response.data;
  } catch (error) {
    throw new Response(
      error.response?.data?.errorMessage ||
        error.message ||
        "Failed to fetch profile details. Please try again.",
      { status: error.status || 500 }
    );
  }
}

export async function profileAction({ request }) {
  const data = await request.formData();

  const profileData = {
    name: data.get("name"),
    email: data.get("email"),
    mobileNumber: data.get("mobileNumber"),
    street: data.get("street"),
    city: data.get("city"),
    state: data.get("state"),
    postalCode: data.get("postalCode"),
    country: data.get("country"),
  };
  try {
    const response = await apiClient.put("/profile", profileData);
    return { success: true, profileData: response.data };
  } catch (error) {
    if (error.response?.status === 400) {
      return { success: false, errors: error.response?.data };
    }
    throw new Response(
      error.response?.data?.errorMessage ||
        error.message ||
        "Failed to save profile details. Please try again.",
      { status: error.status || 500 }
    );
  }
}
