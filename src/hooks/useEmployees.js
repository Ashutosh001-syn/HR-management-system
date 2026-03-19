import { useCallback, useEffect, useState } from "react";
import { getUsersDetail } from "@/api/adminApi";
import { normalizeEmployee } from "@/utils/helpers";

function matchesEmployeeId(user, targetId) {
  if (!user || targetId === null || targetId === undefined) {
    return false;
  }

  const normalizedTargetId = String(targetId).trim();
  const candidateIds = [
    user.id,
    user.emp_id,
    user._id,
    user.userid,
    user.user_id,
  ]
    .filter((value) => value !== null && value !== undefined && value !== "")
    .map((value) => String(value).trim());

  return candidateIds.includes(normalizedTargetId);
}

export default function useEmployees(autoFetch = true) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchEmployees = useCallback(async (params = {}) => {
    setLoading(true);
    setError("");

    try {
      const data = await getUsersDetail(params);
      const list = Array.isArray(data) ? data : data?.data || [];
      const normalized = list.map((user, index) => normalizeEmployee(user, index));
      setEmployees(normalized);
      return normalized;
    } catch (err) {
      setError(err.message || "Failed to fetch employees");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEmployeeById = useCallback(async (id) => {
    const data = await getUsersDetail({ id });
    const list = Array.isArray(data) ? data : data?.data || [];
    const matchedEmployee = list.find((user) => matchesEmployeeId(user, id));

    if (matchedEmployee) {
      return normalizeEmployee(matchedEmployee);
    }

    const cachedEmployee = employees.find((user) => String(user.id).trim() === String(id).trim());
    return cachedEmployee || null;
  }, [employees]);

  useEffect(() => {
    if (autoFetch) {
      fetchEmployees();
    }
  }, [autoFetch, fetchEmployees]);

  return {
    employees,
    setEmployees,
    loading,
    error,
    fetchEmployees,
    fetchEmployeeById,
  };
}
