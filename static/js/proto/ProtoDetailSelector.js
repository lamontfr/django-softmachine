/* 
 * ProtoDetailSelector,  Selecciona los detalles posibles   
 *    
 * 1.  presentar el arbol de campos para seleccionar los detalles
 * 
 */

Ext.define('ProtoUL.proto.ProtoDetailSelector', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.protoDetailSelector',

// Contenedor para probar el arbol de detalles 
    
// @protoOption   Required 
    protoOption : null, 

 // @myMeta   Required 
    myMeta : null, 

    initComponent: function() {
        
        me = this; 

        var tBar =  Ext.create( 'ProtoUL.proto.ProtoToolBar', {dock : 'top'})
        
        var elemTree = Ext.create('ProtoUL.proto.ProtoDetailTree', {
            protoOption : me.protoOption, 
            myMeta : me.myMeta 
           })


        var elemList = Ext.create('ProtoUL.ux.ProtoList', {
            checkStyle : false, 
            idTitle: 'SelectedFields' 
        })


        // ----------------------------------------------------------------------------

        elemTree.on({
            'loadComplete': function (  treeStore, records,  successful,  eOpts ) {
                configureCurrentDetails()
            }, 
            'checkModif': function (  node,  checked,  eOpts ) {
                var idx = node.get( 'id' )
                elemList.addOrRemove ( idx, checked  ) 
            }, 
            scope: me }
        );


        tBar.on({
            'preview': function () {
                savePreview()
            }, 
            'save': function () {
                savePreview(); 
                savePci( me.myMeta )         
            }, 
            scope: me }
        );


        // ----------------------------------------------------------------------------

        var panelItems = getSelectorsPanels( elemTree, elemList  )

        Ext.apply(this, {
            layout: 'border',
            items: panelItems, 
            dockedItems: [ tBar ] 
        });
          
        this.callParent(arguments);
        
        function configureCurrentDetails() {

            // Crea los campos activos en la grilla 
            for (var ix in me.myMeta.protoDetails ) {
                var vFld  =  me.myMeta.protoDetails[ix];

                elemList.addDataItem ( vFld.menuText, true  ) 
            } 
        };
        
        
        function savePreview() {
            
            var names = elemList.getList(),
                detail = {},  
                details = []
                
            for (var ix in names  ) {
                
                detail = getExistingDetail( names[ix] )
                if ( ! detail ) {
                    detail = getDefaultDetail( names[ix] )
                }
                if ( detail ) {
                    details.push( detail )   
                } else { 
                    console.log( "Detalle no encontrado", names[ix]  )
                } 
                
            } 
            
            // Actualiza los nuevos detalles 
            me.myMeta.protoDetails = details 
            
            function getExistingDetail( name  ) {
                for (var ix in me.myMeta.protoDetails ) {
                    var vFld  =  me.myMeta.protoDetails[ix];
                    if ( vFld.menuText == name ) {
                        return vFld 
                        break ; 
                    }
                } 
            }
            
            function getDefaultDetail( name  ) {
                
                var rec =  elemTree.treeStore.getNodeById( name ) 
                return  {
                    menuText : rec.get( 'id' ), 
                    conceptDetail :  rec.get( 'conceptDetail' ), 
                    masterField :  "pk" ,
                    detailField :  rec.get( 'detailField' )
                    // detailTitleLbl :   rec.get( 'detailTitleLbl' ),  
                    // detailTitlePattern :  rec.get( 'detailTitlePattern' )
                }  
            }
            
        }; 
        
    } 


});


/* 
 * Lectura del arbol de detalles 
 * 
 */

Ext.define('ProtoUL.proto.ProtoDetailTree', {
    extend: 'Ext.tree.Panel',
    alias: 'widget.protoDetailTree',
    

 // @protoOption   Required 
    protoOption : null, 

//  @myMeta   Required 
    myMeta : null, 

    initComponent: function() {
        
        me = this; 
        me.addEvents('checkModif', 'loadComplete');
        
        definieProtoDetailsTreeModel( me.protoOption  )
        
        this.treeStore = Ext.create('Ext.data.TreeStore', {
            autoLoad: true,
            model: 'Proto.DetailsTreeModel',
            root: {
                text:'details',
                expanded: true 
            }, 

            listeners: {
                load: function ( treeStore, records,  successful,  eOpts ) {
                    configureCurrentDetails()
                    me.fireEvent('loadComplete', treeStore, records,  successful,  eOpts );
                }
            }
             
        });

        var tree = Ext.apply(this, {
            store: this.treeStore,
            useArrows: true,
            rootVisible: false ,
            minWidth: 400, 

            columns: [{
                xtype: 'treecolumn', //this is so we know which column will show the tree
                text: 'text',
                flex: 2,
                sortable: true,
                minWidth: 200,
                dataIndex: 'id'
            },{
                flex: 1,
                text: 'conceptDetail',
                dataIndex: 'conceptDetail'
            },{
                flex: 2,
                text: 'detailField',
                dataIndex: 'detailField'
            // },{
                // hidden: true,
                // text: 'detailTitleLbl',
                // dataIndex: 'detailTitleLbl'
            // },{
                // hidden: true,
                // text: 'detailTitlePattern',
                // dataIndex: 'detailTitlePattern'
            }] 
             
        })

        tree.on({
            'checkchange': {fn: function (  node,  checked,  eOpts ) {
                me.fireEvent('checkModif', node,  checked,  eOpts );
            }}, scope: me }
        );

        me.callParent(arguments);
        
        function configureCurrentDetails() {
            
        
            // Recorre el store y marca los campos activos
            // me.getView().getStore().each(function(record){
            me.getRootNode().cascadeBy(function(record){
                
                var lRec = { 
                    'conceptDetail'  : record.get('conceptDetail' ), 
                    'detailField' : record.get('detailField' )
                    }

                // Evita iterar en el root 
                if ( lRec.conceptDetail )  {
                    
                    // Marca los campos activos en la grilla
                    for (var ix in me.myMeta.protoDetails ) {
                        var vFld  =  me.myMeta.protoDetails[ix];
                        
                        if (( vFld.conceptDetail == lRec.conceptDetail ) && ( vFld.detailField == lRec.detailField )) {
                            record.set( 'checked', true )
                            
                            // Agrega los campos personalisados 
                            record.set( 'id', vFld.menuText )  
                            // record.set( 'detailTitleLbl', vFld.detailTitleLbl ) 
                            // record.set( 'detailTitlePattern', vFld.detailTitlePattern )
                             
                            break ; 
                        }
                    } 
                }
                
                 
             })
        
            
        }
        
        
    } 

    // getCheckedList: function () {
        // var names = [];
        // var lView =  this.getView()
        // var records = lView.getChecked()
        // Ext.Array.each(records, function(rec){
            // var rDet = {}
            // rDet[ "menuText"  ]     =  rec.get( 'id' ) 
            // rDet[ "conceptDetail" ] =  rec.get( 'conceptDetail' ) 
            // rDet[ "masterField" ]   =  "pk" 
            // rDet[ "detailField" ]   =  rec.get( 'detailField' )  
            // rDet[ "detailTitleLbl"] =  rec.get( 'detailTitleLbl' )  
            // rDet[ "detailTitlePattern"] = rec.get( 'detailTitlePattern' )  
            
            // names.push( rDet);
        // });
        // return names 
    // }


});