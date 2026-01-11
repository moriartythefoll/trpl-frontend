import axios from "axios";

const API_URL = "http://localhost:8000/api";

// Update bagian ini (tambahkan /explore)
export const getExploreVenues = async () => {
  try {
    const response = await axios.get(`${API_URL}/explore/venues`);
    // Cek struktur response Laravelmu, biasanya response.data.data
    return response.data.data || response.data;
  } catch (error) {
    console.error("Gagal ambil venues:", error);
    throw error;
  }
};

// Update bagian ini juga
export const getVenueById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/explore/venues/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Gagal ambil detail venue:", error);
    throw error;
  }
};