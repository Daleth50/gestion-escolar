"use client";
import {useEffect,useState} from "react";
import {schoolStore} from "@/lib/schoolStore";
export function useCatalogo<T extends {id:string}>(service:{listar:()=>T[];guardar:(item:T)=>void;eliminar:(id:string)=>void},initial:Omit<T,"id">){
 const [items,setItems]=useState<T[]>([]);
 const [form,setForm]=useState<Omit<T,"id">>(initial);
 const [id,setId]=useState<string|null>(null);
 const [error,setError]=useState("");
 useEffect(()=>{const refresh=()=>setItems(service.listar());refresh();return schoolStore.suscribir(refresh);},[service]);
 const campo=<K extends keyof Omit<T,"id">>(key:K,value:Omit<T,"id">[K])=>setForm(x=>({...x,[key]:value}));
 const cancelar=()=>{setId(null);setForm(initial);setError("");};
 const editar=(item:T)=>{const {id,...values}=item;setId(id);setForm(values as Omit<T,"id">);setError("");};
 const guardar=()=>{try{service.guardar({...form,id:id??crypto.randomUUID()} as T);cancelar();}catch(e){setError(e instanceof Error?e.message:"Error");}};
 const eliminar=(itemId:string)=>{try{service.eliminar(itemId);if(id===itemId)cancelar();}catch(e){setError(e instanceof Error?e.message:"Error");}};
 return {items,form,id,error,campo,editar,guardar,eliminar,cancelar};
}
