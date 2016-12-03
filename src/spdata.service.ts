import {Injectable} from '@angular/core';

import pnp from 'sp-pnp-js';
import * as _ from 'lodash';
import {Expense} from '../model/expense.model';
import {Provider} from '../model/provider.model';
import {TaxonomyHiddenList} from '../model/taxonomyHiddenList.model';
import {Observable} from 'rxjs';
import {TaxesCategory} from "../model/taxesCategory.model";
import {Revenu} from "../model/revenu.model";
import {Transaction} from "../model/transaction.model";
import {Reimbursement} from "../model/reimbursement.model";

@Injectable()
export class SpDataService {
  expenses: Expense[] = [];
  providers: Provider[] = [];
  taxonomyHiddenList: TaxonomyHiddenList[] = [];
  revenues: Revenu[] = [];
  transactions: Transaction[] = [];
  reimbursements: Reimbursement[] = [];

  constructor() {
  }

  getExpenses(year?: number): Observable<Expense[]> {
    var that = this;
    let getAllExObservable = new Observable(observer => {

      that.expenses = []; // Reset Array, because of the push...it was accumulating
      let batch = pnp.sp.createBatch();
      console.log(batch);
      if (year !== undefined) {
        // Content type 0x012000532D570857F0FA419A99D34691A46D25 == Folder content type
        let dateFilterStringForSpecificYearDoc = "Date1 gt '" + year + "-01-01T00:00:00Z' and Date1 lt '" + year + "-12-31T00:00:00Z' and ContentTypeId ne '0x012000532D570857F0FA419A99D34691A46D25'";
        let dateFilterStringForSpecificYearItem = "Date gt '" + year + "-01-01T00:00:00Z' and Date lt '" + year + "-12-31T00:00:00Z' and ContentTypeId ne '0x012000532D570857F0FA419A99D34691A46D25'";
        if (year === 0) {
          dateFilterStringForSpecificYearDoc = "Date1 eq null and ContentTypeId ne '0x012000532D570857F0FA419A99D34691A46D25'";
          dateFilterStringForSpecificYearItem = "Date eq null and ContentTypeId ne '0x012000532D570857F0FA419A99D34691A46D25'";
        }
        pnp.sp.web.lists.getByTitle('Depenses').items.filter(dateFilterStringForSpecificYearDoc).top(5000).inBatch(batch).get().then((res: any) => {
          this.createObjectForDepensesDoc(res);
        });
        pnp.sp.web.lists.getByTitle('D%C3%A9penses').items.filter(dateFilterStringForSpecificYearItem).top(5000).inBatch(batch).get().then((res: any) => {
          this.createObjectForDepensesItem(res);
        });
      } else {
        pnp.sp.web.lists.getByTitle('Depenses').items.top(5000).inBatch(batch).get().then((res: any) => {
          this.createObjectForDepensesDoc(res);
        });
        _.each(this.expenses, )
        pnp.sp.web.lists.getByTitle('D%C3%A9penses').items.top(5000).inBatch(batch).get().then((res: any) => {
          this.createObjectForDepensesItem(res);
        });
      }
      pnp.sp.site.rootWeb.lists.getByTitle('Fournisseurs').items.top(5000).inBatch(batch).get().then((res: any) => {
        _.each(res, item => {
          let x = new Provider;
          x.id = item.Id;
          x.title = item.Title;
          that.providers.push(x);
        });
      });
      pnp.sp.site.rootWeb.lists.getByTitle('TaxonomyHiddenList').items.top(5000).inBatch(batch).get().then((res: any) => {
        _.each(res, item => {
          let x = new TaxonomyHiddenList;
          x.id = item.Id;
          x.path1033 = item.Path1033;
          x.path1036 = item.Path1036;
          x.term1033 = item.Term1033;
          x.term1036 = item.Term1036;
          that.taxonomyHiddenList.push(x);
        });
      });
      batch.execute().then((res) => {
        _.map(that.expenses, (expenseItem) => {
          let taxoItemFiltered = _.filter(that.taxonomyHiddenList, (taxoItem) => {
            return taxoItem.id == expenseItem.flatId;
          });
          if (taxoItemFiltered.length > 0) {
            expenseItem.flat = taxoItemFiltered[0].term1036;
          }
        });
        _.map(that.expenses, (expenseItem) => {
          let taxoItemFiltered = _.filter(that.taxonomyHiddenList, (taxoItem) => {
            return taxoItem.id == expenseItem.taxCategoryId;
          });
          if (taxoItemFiltered.length > 0) {
            expenseItem.taxCategory = taxoItemFiltered[0].term1036;
          }
        });
        _.map(that.expenses, (expenseItem) => {
          let providerItemFiltered = _.filter(that.providers, (providerItem) => {
            return providerItem.id == expenseItem.providerId;
          });
          if (providerItemFiltered.length > 0) {
            expenseItem.provider = providerItemFiltered[0].title;
          }
        });
        observer.next(that.expenses);
        observer.complete();
      });

    });
    return getAllExObservable as Observable<Expense[]>;
  }
  createObjectForDepensesDoc(res: any) {
    _.each(res, item => {
      let x = new Expense;
      x.type = 'Document';
      x.price = item.Prix;
      x.validated = item.Valide;
      x.id = item.Id;
      x.created = item.Created;
      x.modified = item.Modified;
      if (item.Date1 != null) {
        x.date = new Date(item.Date1).format('yyyy-MM-dd');
      }
      x.authorId = item.AuthorId;
      x.providerId = parseInt(item.FournisseursId);
      x.title = item.Title;
      x.manager = item.GestionnairesChoice;
      x.p = item.P;
      x.relativeEditLink = _spPageContextInfo.webAbsoluteUrl + '/Depenses/Forms/EditForm.aspx?ID=' + item.Id + '&Source=' + window.location.href;
      if (x.date != undefined) {
        x.year = parseInt(x.date.substr(0, 4));
      }
      if (item.Logements) {
        x.flatId = parseInt(item.Logements.Label);
      }
      if (item.TaxesCategory) {
        x.taxCategoryId = parseInt(item.TaxesCategory.Label);
      }
      this.expenses.push(x);
    });
  }
  createObjectForDepensesItem(res: any) {
    _.each(res, item => {
      let x = new Expense;
      x.type = 'item';
      x.price = item.Montant;
      x.validated = item.Valid_x00e9_;
      x.id = item.Id;
      x.created = item.Created;
      x.modified = item.Modified;
      x.date = item.Date;
      x.authorId = parseInt(item.AuthorId);
      x.providerId = item.FournisseursId;
      x.title = item.Title;
      x.manager = item.GestionnairesChoice;
      x.p = item.P;
      x.relativeEditLink = _spPageContextInfo.webAbsoluteUrl + '/Lists/depenses/EditForm.aspx?ID=' + item.Id + '&Source=' + window.location.href;
      if (x.date != undefined) {
        x.year = parseInt(x.date.substr(0, 4));
      }
      if (item.Logements) {
        x.flatId = parseInt(item.Logements.Label);
      }
      if (item.TaxesCategory) {
        x.taxCategoryId = parseInt(item.TaxesCategory.Label);
      }
      this.expenses.push(x);

    });
  }
  getTaxonomyHiddenList() {
    return new Promise((resolve, reject) => {
      var taxonomyHiddenList: [TaxonomyHiddenList];
      pnp.sp.site.rootWeb.lists.getByTitle('TaxonomyHiddenList').items.top(5000).get().then((res: any) => {
        _.each(res, item => {
          let x = new TaxonomyHiddenList;
          x.id = item.Id;
          x.path1033 = item.Path1033;
          x.path1036 = item.Path1036;
          x.term1033 = item.Term1033;
          x.term1036 = item.Term1036;
          taxonomyHiddenList.push(x);
        });
        return taxonomyHiddenList;
      });
    });

  }
  getTaxCategories(): Observable<TaxesCategory[]> {
    let taxCatObservable = new Observable(observer => {
      var taxCatRaw = [
        {
          title: 'Publicité',
          number: 8521,
          taxeCategory: 28
        },
        {
          title: 'Assurances',
          number: 8690,
          taxeCategory: 18
        },
        {
          title: 'Intérêts',
          number: 8710
        },
        {
          title: 'Frais de bureau',
          number: 8810,
          taxeCategory: 23
        },
        {
          title: 'Frais comptables, juridiques et autres honoraires',
          number: 8860,
          taxeCategory: 30
        },
        {
          title: "Frais de gestion et d'administration",
          number: 8871,
          taxeCategory: 37
        },
        {
          title: 'Entretien et réparation',
          number: 8960,
          taxeCategory: 21
        },
        {
          title: 'Salaires, traitements et avantages',
          number: 9060,
          taxeCategory: 38
        },
        {
          title: 'Impôt foncier',
          number: 9180,
          taxeCategory: 19
        },
        {
          title: 'Frais de voyage',
          number: 9200,
          taxeCategory: 39
        },
        {
          title: 'Service publics',
          number: 9220,
          taxeCategory: 32
        },
        {
          title: 'Dépenses relatives aux véhicules à moteur',
          number: 9281,
          taxeCategory: 41
        },
        {
          title: 'Autres dépenses',
          number: 9270,
          taxeCategory: 42
        }
      ];
      var taxCategories: TaxesCategory[] = [];
      _.each(taxCatRaw, item => {
        let x = new TaxesCategory;
        x.title = item.title;
        x.number = item.number;
        x.taxeCategory = item.taxeCategory;
        taxCategories.push(x);
      });
      observer.next(taxCategories);
      observer.complete();
    });
    return taxCatObservable as Observable<TaxesCategory[]>;
  }
  getRevenues(year?: number): Observable<Revenu[]> {
    let dateFilterString = "Date gt '" + year + "-01-01T00:00:00Z' and Date lt '" + year + "-12-31T00:00:00Z'";
    let revenuesObs = new Observable(observer => {
      this.revenues = [];
      pnp.sp.web.lists.getByTitle('Revenue (Loyer et autres)').items.filter(dateFilterString).top(5000).get().then((res: any) => {
        _.each(res, item => {
          let x = new Revenu;
          x.id = item.Id;
          x.r1821 = item.revPremier;
          x.r1823 = item.revTroisieme;
          x.r1825 = item.revDeuxieme;
          x.date = item.Date;
          this.revenues.push(x);
        });
        observer.next(this.revenues);
        observer.complete();
      });
    });
    return revenuesObs as Observable<Revenu[]>;
  }
  getTransactionCompte(year?: number): Observable<Transaction[]> {
    let dateFilterString = "Date gt '" + year + "-01-01T00:00:00Z' and Date lt '" + year + "-12-31T00:00:00Z'";
    let revenuesObs = new Observable(observer => {
      this.transactions = [];
      pnp.sp.web.lists.getByTitle('Transactions Compte Banque').items.filter(dateFilterString).top(5000).get().then((res: any) => {
        _.each(res, item => {
          let x = new Transaction;
          x.id = item.Id;
          x.folio = item.CompteNumero;
          x.accountType = item.CompteType;
          x.date = item.Date;
          x.number = 0;
          x.description = item.Description;
          x.withdrawal = item.Retrait;
          x.deposit = item.Depot;
          x.interest = item.Interet;
          x.refund = item.Remboursement;
          x.balance = item.Solde;
          this.transactions.push(x);
        });
        observer.next(this.transactions);
        observer.complete();
      });
    });
    return revenuesObs as Observable<Transaction[]>;
  }
  getReimbursement(): Observable<Reimbursement[]> {
    let ReimbursementObs = new Observable(observer => {
      this.reimbursements = [];
      pnp.sp.web.lists.getByTitle('Remboursement').items.top(5000).get().then((res: any) => {
        _.each(res, item => {
          let x = new Reimbursement();
          x.id = item.Id;
          x.title = item.Title;
          x.date = item.Date;
          x.manager = item.GestionnairesChoice;
          x.type = item.TypeRemboursement;
          x.amount = item.Montant;
          x.year = parseInt(item.Ann_x00e9_e.substring(0, 4)); // TODO : devrait être plus clean
          this.reimbursements.push(x);
        });
        observer.next(this.reimbursements);
        observer.complete();
      });
    });
    return ReimbursementObs as Observable<Reimbursement[]>;
  }
}
